import {
	type RoomRepository,
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
import type { TurnStreamingService } from "../../services/turn-streaming.service";

import type { RetryTurnCommand, RetryTurnOutput } from "./command";

/**
 * @description
 * `RetryTurnHandler` — Command Handler
 *
 * Resets a failed turn back to a streamable state, rebuilds the prompt
 * context, then delegates to `TurnStreamingService` — the same streaming
 * lifecycle `InitiateParticipantTurnHandler` uses.
 *
 * @see TurnStreamingService — for the streaming/accumulate/settle lifecycle
 * @see TurnLifecycleOrchestrator.retry — for the FAILED → PENDING reset
 */
export class RetryTurnHandler
	implements ICommand<RetryTurnCommand, RetryTurnOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly transcriptor: TranscriptorRenderer,
		private readonly streaming: TurnStreamingService,
	) {}

	public async execute(
		command: RetryTurnCommand,
	): Promise<IResult<RetryTurnOutput, DomainError>> {
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

		const intent = turn.get("intent");
		if (!intent) {
			return Result.error(
				new DomainError("Retry turn missing intent", { context: "RetryTurn" }),
			);
		}

		const turns = await this.turnRepository.findByRoom(room);
		const participants = room.get("participants");

		const systemPrompt = this.transcriptor.buildSystemPrompt({
			currentParticipant: participant,
			intent,
			participants,
		});

		const messages = this.transcriptor.render({ participants, turns });

		const streamResult = await this.streaming.streamAndSettle({
			turnId: turn.id,
			roomId: room.id,
			messages,
			qualifiedModel: participant.qualifiedModel,
			systemPrompt,
		});

		if (streamResult.isError()) return Result.error(streamResult.error());

		return Result.success({ newTurnId: turn.id.value() });
	}
}
