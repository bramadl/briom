import {
	type IntentOption,
	type IUsageRepository,
	ParticipantId,
	type RoomDeliberation,
	RoomId,
	type RoomRepository,
	type TranscriptorRenderer,
	TurnId,
	TurnIntent,
	TurnLimitExceededError,
	type TurnLimitPolicy,
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
import { after } from "next/server";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";
import type { TurnStreamingService } from "../../services/turn-streaming.service";

import type {
	InitiateParticipantTurnCommand,
	InitiateParticipantTurnOutput,
} from "./command";

/**
 * @description
 * `InitiateParticipantTurnHandler` — Command Handler
 *
 * Validates that a participant can take a turn in this room right now,
 * creates the turn, then delegates the LLM call and streaming lifecycle
 * to `TurnStreamingService`.
 *
 * **render() is awaited**
 * `TranscriptorRenderer.render()` is now async — it fetches text attachment
 * content from Supabase Storage on demand for any moderator turns that carry
 * text files. The `after()` callback captures the resolved `messages` array,
 * so Storage reads happen before streaming begins (not inside the SSE loop).
 *
 * @see TurnStreamingService — for the streaming/accumulate/settle lifecycle
 * @see TurnLifecycleOrchestrator — for the turn state machine
 * @see RoomDeliberation — for intent validation rules
 * @see TranscriptorRenderer — for attachment-aware message building
 */
export class InitiateParticipantTurnHandler
	implements
		ICommand<
			InitiateParticipantTurnCommand,
			InitiateParticipantTurnOutput,
			DomainError
		>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly sequencer: TurnSequencer,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly deliberation: RoomDeliberation,
		private readonly transcriptor: TranscriptorRenderer,
		private readonly eventBus: IEventBus,
		private readonly streaming: TurnStreamingService,
		private readonly usageRepository: IUsageRepository,
		private readonly turnLimit: TurnLimitPolicy,
	) {}

	public async execute(
		command: InitiateParticipantTurnCommand,
	): Promise<IResult<InitiateParticipantTurnOutput, DomainError>> {
		const { roomId, participantId, intent, moderatorId } = command.input;

		let currentCount = 0;
		const usage = await this.usageRepository.getUsage(moderatorId);
		if (usage) {
			if (this.turnLimit.isNewPeriod(usage.periodStart)) {
				await this.usageRepository.resetPeriod(moderatorId);
				currentCount = 0;
			} else {
				currentCount = usage.count;
			}
		}

		if (this.turnLimit.isExceeded(currentCount)) {
			return Result.error(
				new TurnLimitExceededError(currentCount, this.turnLimit.LIMIT),
			);
		}

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
			{ participantId: ParticipantId(participantId), intent: turnIntent },
		);

		if (validation.isError()) return Result.error(validation.error());

		const nextSequence = await this.sequencer.nextPositionInside(room);
		const initiateResult = await this.orchestrator.initiateParticipantTurn({
			id: TurnId(),
			roomId: RoomId(roomId),
			sequence: nextSequence,
			participantId: ParticipantId(participantId),
			intent: turnIntent,
		});

		if (initiateResult.isError()) return Result.error(initiateResult.error());

		const turn = initiateResult.value();
		room.registerTurn(turn.id);

		await this.roomRepository.persist(room);
		await this.usageRepository.increment(moderatorId);

		const turnEvents = turn.pullEvents();
		const roomEvents = room.pullEvents();
		await this.eventBus.publishAll([...turnEvents, ...roomEvents]);

		const systemPrompt = this.transcriptor.buildSystemPrompt({
			currentParticipant: participant,
			intent: intent as IntentOption,
			participants,
		});

		const messages = await this.transcriptor.render({ participants, turns });

		after(() =>
			this.streaming.streamAndSettle({
				turnId: turn.id,
				roomId: RoomId(roomId),
				messages,
				qualifiedModel: participant.qualifiedModel,
				systemPrompt,
			}),
		);

		return Result.success({ turnId: turn.id.value() });
	}
}
