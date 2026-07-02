import { type IRoomRepository, ModeratorId, RoomId } from "@briom/domain";
import {
	ApplicationError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { RenameRoomCommand, RenameRoomOutput } from "./command";

/**
 * @description
 * Application-layer command handler responsible for renaming a Room.
 *
 * Resolves the Room aggregate, verifies moderator ownership, delegates the
 * rename operation to the domain, and returns the updated title.
 */
export class RenameRoomHandler
	implements ICommand<RenameRoomCommand, RenameRoomOutput, ApplicationError>
{
	public constructor(private readonly roomRepository: IRoomRepository) {}

	public async execute({
		input,
	}: RenameRoomCommand): Promise<IResult<RenameRoomOutput, ApplicationError>> {
		const roomId = RoomId(input.roomId);
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			return Result.error(ApplicationError.notFound("Room not found"));
		}

		const moderatorId = ModeratorId(input.moderatorId);
		const isMatch = room.get("moderatorId").isEqual(moderatorId);
		if (!isMatch) {
			return Result.error(ApplicationError.forbidden());
		}

		const title = input.title;
		const renameResult = room.rename(title);
		if (renameResult.isError()) {
			const domainError = renameResult.error();
			return Result.error(
				ApplicationError.badRequest(domainError.message).causedBy(domainError),
			);
		}

		return Result.success({ title } satisfies RenameRoomOutput);
	}
}
