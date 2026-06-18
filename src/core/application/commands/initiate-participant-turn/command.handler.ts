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

export class InitiateParticipantTurnHandler
	implements
		ICommand<
			InitiateParticipantTurnCommand,
			InitiateParticipantTurnOutput,
			DomainError | StreamError
		>
{
	constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly sequencer: TurnSequencer,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly deliberation: RoomDeliberation,
		private readonly transcriptor: TranscriptorRenderer,
		private readonly llmGateway: LlmGateway,
		private readonly eventBus: IEventBus,
	) {}

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

		// Publish initiation events immediately so client knows turn is pending
		const turnEvents = turn.pullEvents();
		const roomEvents = room.pullEvents();
		await this.eventBus.publishAll([...turnEvents, ...roomEvents]);

		// Build LLM input
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

		// Start streaming — transition PENDING → STREAMING
		const startResult = await this.orchestrator.startStream(turn.id);
		if (startResult.isError()) {
			// Should not happen if orchestrator state is consistent, but handle defensively
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
					// Streaming state desync — abort and fail
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

		// Settle — transition STREAMING → SETTLED
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
