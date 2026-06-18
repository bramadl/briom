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

/**
 * @description
 * `ConcludeDeliberationHandler` — Command Handler
 *
 * Executes the conclusion of a deliberation.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Delegate to `Room.conclude()` domain method
 * 3. Persist room
 * 4. Publish `DeliberationConcluded` domain event
 *
 * **Invariant Enforcement**
 * - Room must exist
 * - Room must be in `DELIBERATING` or `PAUSED` status
 *
 * **Events Published**
 * - `DeliberationConcluded` — signals that the thinking session is complete
 *
 * @see Room.conclude — for domain rules
 * @see RoomSseSubscriber — for event forwarding
 */
export class ConcludeDeliberationHandler
	implements
		ICommand<ConcludeDeliberationCommand, void, CannotConcludeRoomError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Concludes deliberation in a room.
	 *
	 * @param command - Room ID to conclude
	 * @returns Result containing void, or CannotConcludeRoomError
	 */
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
