import {
	type IntentOption,
	ParticipantId,
	type RoomDeliberation,
	RoomId,
	type RoomRepository,
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

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type {
	InitiateParticipantTurnCommand,
	InitiateParticipantTurnOutput,
} from "./command";

export class InitiateParticipantTurnHandler
	implements
		ICommand<
			InitiateParticipantTurnCommand,
			InitiateParticipantTurnOutput,
			DomainError
		>
{
	constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly sequencer: TurnSequencer,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly deliberation: RoomDeliberation,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: InitiateParticipantTurnCommand,
	): Promise<IResult<InitiateParticipantTurnOutput, DomainError>> {
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

		return Result.success({ turnId: turn.id.value() });
	}
}
