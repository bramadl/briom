import {
	type CannotResumeRoomError,
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

import type { ResumeDeliberationCommand } from "./command";

/**
 * @description
 * `ResumeDeliberationHandler` — Command Handler
 *
 * Executes the resumption of a paused deliberation.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Delegate to `Room.resume()` domain method
 * 3. Persist room
 * 4. Publish `DeliberationResumed` domain event
 *
 * **Invariant Enforcement**
 * - Room must exist
 * - Room must be in `PAUSED` status
 *
 * **Events Published**
 * - `DeliberationResumed` — signals that turn initiation is available again
 *
 * @see Room.resume — for domain rules
 * @see RoomSseSubscriber — for event forwarding
 */
export class ResumeDeliberationHandler
	implements ICommand<ResumeDeliberationCommand, void, CannotResumeRoomError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Resumes deliberation in a room.
	 *
	 * @param command - Room ID to resume
	 * @returns Result containing void, or CannotResumeRoomError
	 */
	public async execute(
		command: ResumeDeliberationCommand,
	): Promise<IResult<void, CannotResumeRoomError>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "ResumeDeliberation" }),
			);
		}

		const result = room.resume();
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success(undefined);
	}
}
