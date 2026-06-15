import { RoomId, RoomNotFoundError, type RoomRepository } from "@briom/domain";
import { type ICommand, type IResult, Result } from "@briom/drimion";

import type {
	RenameRoomCommand,
	RenameRoomErrors,
	RenameRoomOutput,
} from "./command";

export class RenameRoomHandler
	implements ICommand<RenameRoomCommand, RenameRoomOutput, RenameRoomErrors>
{
	public constructor(private readonly roomRepository: RoomRepository) {}

	public async execute({
		input,
	}: RenameRoomCommand): Promise<IResult<RenameRoomOutput, RenameRoomErrors>> {
		const roomId = RoomId(input.roomId);

		const room = await this.roomRepository.findById(roomId);
		if (!room) return Result.error(new RoomNotFoundError(roomId));

		room.set("title").to(input.title);
		await this.roomRepository.save(room);

		return Result.success(null as never);
	}
}
