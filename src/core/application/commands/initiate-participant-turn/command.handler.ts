import {
	type IntentOption,
	type LlmGateway,
	ParticipantId,
	type RoomDeliberation,
	RoomId,
	type RoomRepository,
	StreamError,
	type TranscriptorRenderer,
	TurnId,
	TurnIntent,
	type TurnRepository,
	type TurnSequencer,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services";

import type {
	InitiateParticipantTurnCommand,
	InitiateParticipantTurnOutput,
} from "./command";

/**
 * @description
 * `InitiateParticipantTurnHandler` — Command Handler
 *
 * Executes the full AI participant turn lifecycle: initiation, LLM streaming,
 * token accumulation, and settlement (or failure).
 *
 * **Flow**
 * 1. Find room and verify it's deliberating
 * 2. Find participant and validate intent against deliberation context
 * 3. Generate next sequence
 * 4. Orchestrator initiates participant turn (PENDING)
 * 5. Publish initiation events (client sees turn is pending)
 * 6. Build system prompt and message history via `TranscriptorRenderer`
 * 7. Call LLM gateway for streaming response
 * 8. On stream error: fail turn immediately
 * 9. On stream success: start streaming, accumulate tokens, settle on completion
 * 10. Handle any errors during streaming by failing the turn
 *
 * **Complexity Justification**
 * This handler is intentionally thick. It coordinates domain, infrastructure,
 * and real-time concerns that cannot be separated without losing the atomic
 * nature of a turn. The orchestrator handles state transitions; this handler
 * handles the LLM integration and streaming loop.
 *
 * **Error Handling**
 * - Room not found / not deliberating → immediate error
 * - Participant not found → immediate error
 * - Invalid intent for context → immediate error (enforced by RoomDeliberation)
 * - LLM stream error → turn fails, error published via SSE
 * - Accumulate error during streaming → turn fails, partial tokens discarded
 * - Settle error after streaming → turn fails, full tokens discarded
 *
 * **Events Published**
 * - `TurnInitiated` — turn slot created
 * - `TurnStreamStarted` — LLM connection established
 * - `TurnTokenAccumulated` — each token (multiple, during streaming)
 * - `TurnSettled` — turn complete with full perspective
 * - `TurnFailed` — turn encountered error
 * - `TurnRegistered` — room history updated
 *
 * @see TurnLifecycleOrchestrator — for state transition management
 * @see TranscriptorRenderer — for prompt building
 * @see LlmGateway — for LLM streaming contract
 * @see RoomDeliberation — for intent validation
 */
export class InitiateParticipantTurnHandler
	implements
		ICommand<
			InitiateParticipantTurnCommand,
			InitiateParticipantTurnOutput,
			DomainError | StreamError
		>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly sequencer: TurnSequencer,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly deliberation: RoomDeliberation,
		private readonly transcriptor: TranscriptorRenderer,
		private readonly llmGateway: LlmGateway,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Creates and streams an AI participant turn.
	 *
	 * @param command - Room ID, participant ID, and intent
	 * @returns Result containing turnId, or domain/stream error
	 */
	public async execute(
		command: InitiateParticipantTurnCommand,
	): Promise<
		IResult<InitiateParticipantTurnOutput, DomainError | StreamError>
	> {
		const { roomId, participantId, intent } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", {
					context: "InitiateParticipantTurn",
				}),
			);
		}

		if (!room.isDeliberating) {
			return Result.error(
				new DomainError("Room is not deliberating", {
					context: "InitiateParticipantTurn",
				}),
			);
		}

		const participant = room.findParticipantById(ParticipantId(participantId));
		if (!participant) {
			return Result.error(
				new DomainError("Participant not found", {
					context: "InitiateParticipantTurn",
				}),
			);
		}

		const turns = await this.turnRepository.findByRoom(room);
		const participants = room.get("participants");

		const turnIntent = TurnIntent.from(intent as IntentOption);
		const validation = this.deliberation.validateIntent(
			{ room, turns, participants },
			{
				participantId: ParticipantId(participantId),
				intent: turnIntent,
			},
		);

		if (validation.isError()) return Result.error(validation.error());

		const nextSequence = await this.sequencer.nextPositionInside(room);
		const result = await this.orchestrator.initiateParticipantTurn({
			id: TurnId(),
			roomId: RoomId(roomId),
			sequence: nextSequence,
			participantId: ParticipantId(participantId),
			intent: turnIntent,
		});

		if (result.isError()) return Result.error(result.error());

		const turn = result.value();
		room.registerTurn(turn.id);

		await this.roomRepository.persist(room);

		const turnEvents = turn.pullEvents();
		const roomEvents = room.pullEvents();
		await this.eventBus.publishAll([...turnEvents, ...roomEvents]);

		const systemPrompt = this.transcriptor.buildSystemPrompt({
			currentParticipant: participant,
			intent: intent as IntentOption,
			participants,
		});

		const messages = this.transcriptor.render({ participants, turns });

		const streamResult = await this.llmGateway.stream({
			messages,
			qualifiedModel: participant.qualifiedModel,
			systemPrompt,
		});

		if (streamResult.isError()) {
			await this.orchestrator.fail(turn.id, streamResult.error());
			return Result.error(streamResult.error());
		}

		const startResult = await this.orchestrator.startStream(turn.id);
		if (startResult.isError()) {
			await this.orchestrator.fail(
				turn.id,
				StreamError.streamFailure("Failed to start stream"),
			);
			return Result.error(startResult.error());
		}

		const stream = streamResult.value();
		const tokens: string[] = [];

		try {
			const reader = stream.getReader();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				tokens.push(value);
				const accumulateResult = await this.orchestrator.accumulate(
					turn.id,
					value,
				);

				if (accumulateResult.isError()) {
					reader.releaseLock();
					await this.orchestrator.fail(
						turn.id,
						StreamError.streamFailure("Accumulate failed during streaming"),
					);
					return Result.error(accumulateResult.error());
				}
			}
			reader.releaseLock();
		} catch (streamError) {
			await this.orchestrator.fail(
				turn.id,
				StreamError.streamFailure(
					streamError instanceof Error
						? streamError.message
						: "Stream reading failed",
				),
			);

			return Result.error(
				new DomainError("Stream reading failed", {
					context: "InitiateParticipantTurn",
				}),
			);
		}

		const fullContent = tokens.join("");
		const settleResult = await this.orchestrator.settle(turn.id, fullContent);

		if (settleResult.isError()) {
			await this.orchestrator.fail(
				turn.id,
				StreamError.streamFailure("Settle failed after streaming"),
			);
			return Result.error(settleResult.error());
		}

		return Result.success({ turnId: turn.id.value() });
	}
}
