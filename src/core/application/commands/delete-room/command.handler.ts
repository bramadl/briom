import { RoomId, type RoomRepository } from "@briom/domain";
import { type ICommand, type IResult, Result } from "@briom/libs/drimion";

import type { DeleteRoomCommand } from "./command";

export class DeleteRoomHandler
	implements ICommand<DeleteRoomCommand, void, never>
{
	public constructor(private readonly roomRepository: RoomRepository) {}

	public async execute(
		command: DeleteRoomCommand,
	): Promise<IResult<void, never>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) return Result.success(undefined);

		await this.roomRepository.close(room);

		return Result.success(undefined);
	}
}
