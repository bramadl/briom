import {
	type LlmGateway,
	type RoomRepository,
	StreamError,
	type TranscriptorRenderer,
	TurnId,
	type TurnRepository,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { RetryTurnCommand, RetryTurnOutput } from "./command";

/**
 * @description
 * `RetryTurnHandler` — Command Handler
 *
 * Executes the retry of a failed participant turn.
 *
 * **Flow**
 * 1. Orchestrator retries the turn (`FAILED` → `PENDING`)
 * 2. Find the retried turn and its room
 * 3. Rebuild LLM context (system prompt + message history)
 * 4. Call LLM gateway for new streaming response
 * 5. Stream, accumulate, and settle (same as `InitiateParticipantTurn`)
 *
 * **Why Full Re-stream?**
 * Retry regenerates the perspective from scratch. The original failed tokens
 * are discarded. This ensures the turn is a coherent, complete contribution.
 *
 * **Events Published**
 * - `TurnRetried` — signals retry initiation
 * - `TurnInitiated` — signals reset to PENDING
 * - `TurnStreamStarted` — LLM connection established
 * - `TurnTokenAccumulated` — each token during re-streaming
 * - `TurnSettled` — retry succeeded
 * - `TurnFailed` — retry also failed
 *
 * @see TurnLifecycleOrchestrator.retry — for state reset
 * @see InitiateParticipantTurnHandler — for similar streaming logic
 */
export class RetryTurnHandler
	implements
		ICommand<RetryTurnCommand, RetryTurnOutput, DomainError | StreamError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly transcriptor: TranscriptorRenderer,
		private readonly llmGateway: LlmGateway,
	) {}

	/**
	 * @description
	 * Retries a failed participant turn with fresh LLM streaming.
	 *
	 * @param command - Turn ID to retry
	 * @returns Result containing newTurnId, or domain/stream error
	 */
	public async execute(
		command: RetryTurnCommand,
	): Promise<IResult<RetryTurnOutput, DomainError | StreamError>> {
		const { turnId } = command.input;

		const result = await this.orchestrator.retry(TurnId(turnId));
		if (result.isError()) return Result.error(result.error());

		const turn = await this.turnRepository.findById(TurnId(turnId));
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found after retry", { context: "RetryTurn" }),
			);
		}

		const room = await this.roomRepository.findById(turn.get("roomId"));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "RetryTurn" }),
			);
		}

		const participantId = turn.participantId;
		if (!participantId) {
			return Result.error(
				new DomainError("Retry turn missing participant", {
					context: "RetryTurn",
				}),
			);
		}

		const participant = room.findParticipantById(participantId);
		if (!participant) {
			return Result.error(
				new DomainError("Participant not found", { context: "RetryTurn" }),
			);
		}

		const turns = await this.turnRepository.findByRoom(room);
		const participants = room.get("participants");
		const intent = turn.get("intent");

		if (!intent) {
			return Result.error(
				new DomainError("Retry turn missing intent", { context: "RetryTurn" }),
			);
		}

		const systemPrompt = this.transcriptor.buildSystemPrompt({
			currentParticipant: participant,
			intent: intent,
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
				StreamError.streamFailure("Failed to start stream on retry"),
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
						StreamError.streamFailure(
							"Accumulate failed during retry streaming",
						),
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
						: "Retry stream reading failed",
				),
			);

			return Result.error(
				new DomainError("Retry stream reading failed", {
					context: "RetryTurn",
				}),
			);
		}

		const fullContent = tokens.join("");
		const settleResult = await this.orchestrator.settle(turn.id, fullContent);

		if (settleResult.isError()) {
			await this.orchestrator.fail(
				turn.id,
				StreamError.streamFailure("Settle failed after retry streaming"),
			);

			return Result.error(settleResult.error());
		}

		return Result.success({ newTurnId: turn.id.value() });
	}
}
