import {
	type CannotStartDeliberationError,
	type EmptyTopicError,
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

import type { StartDeliberationCommand } from "./command";

/**
 * @description
 * `StartDeliberationHandler` — Command Handler
 *
 * Executes the start of deliberation in a room.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Delegate to `Room.startDeliberation()` domain method
 * 3. Persist room
 * 4. Publish `DeliberationStarted` domain event
 *
 * **Invariant Enforcement**
 * - Room must exist
 * - Room must be in `FORMING` status
 * - Topic must be non-empty
 * - At least one participant must be invited
 *
 * **Events Published**
 * - `DeliberationStarted` — signals that turns can now be initiated
 *
 * @see Room.startDeliberation — for domain rules
 * @see RoomSseSubscriber — for event forwarding
 */
export class StartDeliberationHandler
	implements
		ICommand<
			StartDeliberationCommand,
			void,
			EmptyTopicError | CannotStartDeliberationError
		>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Starts deliberation in a room.
	 *
	 * @param command - Room ID and topic
	 * @returns Result containing void, or domain error
	 */
	public async execute(
		command: StartDeliberationCommand,
	): Promise<IResult<void, EmptyTopicError | CannotStartDeliberationError>> {
		const { roomId, topic } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "StartDeliberation" }),
			);
		}

		const result = room.startDeliberation(topic);
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success(undefined);
	}
}
