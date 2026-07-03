import {
	type IRoomRepository,
	ModeratorId,
	type Room,
	RoomId,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IResult,
	Result,
} from "@drimion";

import type { CloseRoomCommand, CloseRoomOutput } from "./command";

/**
 * @description
 * Application-layer command handler responsible for permanently closing
 * (and deleting) a Room.
 *
 * Resolves the Room, verifies moderator ownership, delegates closure
 * to the repository (which handles cascade deletion), and returns.
 */
export class CloseRoomHandler
	implements ICommand<CloseRoomCommand, CloseRoomOutput, ApplicationError>
{
	public constructor(private readonly roomRepository: IRoomRepository) {}

	public async execute({
		input,
	}: CloseRoomCommand): Promise<IResult<CloseRoomOutput, ApplicationError>> {
		const roomId = RoomId(input.roomId);
		const moderatorId = ModeratorId(input.moderatorId);

		const roomResult = await this.resolveAuthorizedRoom(roomId, moderatorId);
		if (roomResult.isError()) return Result.error(roomResult.error());

		const room = roomResult.value();
		await this.roomRepository.close(room);

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
	 * Shapes the handler's outcome into the response FE renders.
	 */
	private buildOutput(room: Room): CloseRoomOutput {
		return {
			roomId: room.id.value(),
		};
	}
}
