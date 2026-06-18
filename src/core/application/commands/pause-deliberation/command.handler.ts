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

/**
 * @description
 * `PauseDeliberationHandler` — Command Handler
 *
 * Executes the pause of an active deliberation.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Delegate to `Room.pause()` domain method
 * 3. Persist room
 * 4. Publish `DeliberationPaused` domain event
 *
 * **Invariant Enforcement**
 * - Room must exist
 * - Room must be in `DELIBERATING` status
 *
 * **Events Published**
 * - `DeliberationPaused` — signals that turn initiation is suspended
 *
 * @see Room.pause — for domain rules
 * @see RoomSseSubscriber — for event forwarding
 */
export class PauseDeliberationHandler
	implements ICommand<PauseDeliberationCommand, void, CannotPauseRoomError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Pauses deliberation in a room.
	 *
	 * @param command - Room ID to pause
	 * @returns Result containing void, or CannotPauseRoomError
	 */
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
