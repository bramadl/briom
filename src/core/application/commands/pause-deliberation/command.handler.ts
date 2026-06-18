import {
	type CannotPauseRoomError,
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

import type { PauseDeliberationCommand } from "./command";

export class PauseDeliberationHandler
	implements ICommand<PauseDeliberationCommand, void, CannotPauseRoomError>
{
	constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: PauseDeliberationCommand,
	): Promise<IResult<void, CannotPauseRoomError>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "PauseDeliberation" }),
			);
		}

		const result = room.pause();
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success(undefined);
	}
}
