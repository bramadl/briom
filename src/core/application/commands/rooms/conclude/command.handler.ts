import {
	type IRoomRepository,
	ModeratorId,
	type Room,
	RoomId,
} from "@briom/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { ConcludeRoomCommand, ConcludeRoomOutput } from "./command";

/**
 * @description
 * Application-layer command handler responsible for concluding a Room's
 * deliberation.
 *
 * Resolves the Room, verifies moderator ownership, delegates conclusion
 * to the domain, persists the aggregate, and publishes domain events.
 */
export class ConcludeRoomHandler
	implements ICommand<ConcludeRoomCommand, ConcludeRoomOutput, ApplicationError>
{
	public constructor(
		private readonly roomRepository: IRoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute({
		input,
	}: ConcludeRoomCommand): Promise<
		IResult<ConcludeRoomOutput, ApplicationError>
	> {
		const roomId = RoomId(input.roomId);
		const moderatorId = ModeratorId(input.moderatorId);

		const roomResult = await this.resolveAuthorizedRoom(roomId, moderatorId);
		if (roomResult.isError()) return Result.error(roomResult.error());
		const room = roomResult.value();

		const concludeResult = this.concludeRoom(room);
		if (concludeResult.isError()) return Result.error(concludeResult.error());

		await this.persistAndPublish(room);

		const output = this.buildOutput(room);
		return Result.success(output);
	}

	/**
	 * @description
	 * Loads the Room and verifies the acting Moderator owns it.
	 */
	private async resolveAuthorizedRoom(
		roomId: RoomId,
		moderatorId: ModeratorId,
	): Promise<IResult<Room, ApplicationError>> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found").withCode("ROOM_NOT_FOUND"),
			);
		}

		if (!room.get("moderatorId").isEqual(moderatorId)) {
			return Result.error(ApplicationError.forbidden());
		}

		return Result.success(room);
	}

	/**
	 * @description
	 * Transitions the room out of DELIBERATING.
	 */
	private concludeRoom(room: Room): IResult<void, ApplicationError> {
		const result = room.conclude();
		if (result.isError()) {
			const error = result.error();
			return Result.error(
				ApplicationError.badRequest(error.message).causedBy(error),
			);
		}

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Persists every the room and publishes the all of domain events
	 * collected along the way.
	 */
	private async persistAndPublish(room: Room) {
		await this.roomRepository.persist(room);
		const events = room.pullEvents();
		await this.eventBus.publishAll(events);
	}

	/**
	 * @description
	 * Shapes the handler's outcome into the response FE renders.
	 */
	private buildOutput(room: Room): ConcludeRoomOutput {
		return {
			roomId: room.id.value(),
			status: room.get("status"),
		};
	}
}
