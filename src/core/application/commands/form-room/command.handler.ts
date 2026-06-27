import { ModeratorId, Room, RoomId, type RoomRepository } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { FormRoomCommand, FormRoomOutput } from "./command";

/**
 * @description
 * `FormRoomHandler` — Command Handler
 *
 * Executes the creation of a new `Room` aggregate.
 *
 * **Flow**
 * 1. Delegate to `Room.form()` domain factory
 * 2. Persist room via repository
 * 3. Publish `RoomFormed` domain event
 *
 * **Invariant Enforcement**
 * - Title must be non-empty (enforced by `Room.isValidProps`)
 * - ModeratorId is required (no anonymous rooms in MVP)
 *
 * **Events Published**
 * - `RoomFormed` — signals that a new thinking space is available
 *
 * @see Room.form — for domain construction rules
 * @see RoomSseSubscriber — for event forwarding to clients
 */
export class FormRoomHandler
	implements ICommand<FormRoomCommand, FormRoomOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Creates a new room.
	 *
	 * @param command - Room title and moderator ID
	 * @returns Result containing roomId on success, or EmptyTitleError
	 */
	public async execute(
		command: FormRoomCommand,
	): Promise<IResult<FormRoomOutput, DomainError>> {
		const { title, moderatorId } = command.input;

		const result = Room.form({
			id: RoomId(),
			title,
			moderatorId: ModeratorId(moderatorId),
			createdAt: new Date(),
			synthesis: null,
			synthesisCreatedAt: null,
			synthesisCreatedBy: null,
			synthesisStatus: "idle",
		});

		if (result.isError()) return Result.error(result.error());

		const room = result.value();
		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success({ roomId: room.id.value() });
	}
}
