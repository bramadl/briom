import {
	type EmptyTitleError,
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

import type { RenameRoomCommand } from "./command";

/**
 * @description
 * `RenameRoomHandler` — Command Handler
 *
 * Executes the renaming of a room.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Delegate to `Room.rename()` domain method
 * 3. Persist room
 * 4. Publish any domain events (none currently; Room.rename does not emit)
 *
 * **Invariant Enforcement**
 * - Room must exist
 * - New title must be non-empty
 *
 * @see Room.rename — for domain rules
 */
export class RenameRoomHandler
	implements ICommand<RenameRoomCommand, void, EmptyTitleError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Renames a room.
	 *
	 * @param command - Room ID and new title
	 * @returns Result containing void, or EmptyTitleError
	 */
	public async execute(
		command: RenameRoomCommand,
	): Promise<IResult<void, EmptyTitleError>> {
		const { roomId, newTitle } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "RenameRoom" }),
			);
		}

		const result = room.rename(newTitle);
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success(undefined);
	}
}
