import {
	type CannotConcludeRoomError,
	RoomId,
	type RoomRepository,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { ConcludeDeliberationCommand } from "./command";

export class ConcludeDeliberationHandler
	implements
		ICommand<ConcludeDeliberationCommand, void, CannotConcludeRoomError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: ConcludeDeliberationCommand,
	): Promise<IResult<void, CannotConcludeRoomError>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "ConcludeDeliberation" }),
			);
		}

		const result = room.conclude();
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success(undefined);
	}
}
