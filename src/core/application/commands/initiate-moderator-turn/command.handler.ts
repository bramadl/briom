import {
	ModeratorId,
	RoomId,
	type RoomRepository,
	TurnId,
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
	InitiateModeratorTurnCommand,
	InitiateModeratorTurnOutput,
} from "./command";

export class InitiateModeratorTurnHandler
	implements
		ICommand<
			InitiateModeratorTurnCommand,
			InitiateModeratorTurnOutput,
			DomainError
		>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly sequencer: TurnSequencer,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: InitiateModeratorTurnCommand,
	): Promise<IResult<InitiateModeratorTurnOutput, DomainError>> {
		const { roomId, moderatorId, content } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "InitiateModeratorTurn" }),
			);
		}

		if (!room.isDeliberating) {
			return Result.error(
				new DomainError("Room is not deliberating", {
					context: "InitiateModeratorTurn",
				}),
			);
		}

		const nextSequence = await this.sequencer.nextPositionInside(room);
		const result = await this.orchestrator.initiateModeratorTurn({
			id: TurnId(),
			roomId: RoomId(roomId),
			sequence: nextSequence,
			moderatorId: ModeratorId(moderatorId),
			content,
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
