import {
	RoomId,
	RoomNotFoundError,
	type RoomRepository,
} from "@briom/core/domain";
import { type ICommand, type IResult, Result } from "@briom/libs/drimion";
import type {
	DeleteRoomCommand,
	DeleteRoomErrors,
	DeleteRoomOutput,
} from "./command";

export class DeleteRoomHandler
	implements ICommand<DeleteRoomCommand, DeleteRoomOutput, DeleteRoomErrors>
{
	public constructor(private readonly roomRepository: RoomRepository) {}

	public async execute({
		input,
	}: DeleteRoomCommand): Promise<IResult<never, DeleteRoomErrors>> {
		const roomId = RoomId(input.roomId);

		const room = await this.roomRepository.findById(roomId);
		if (!room) return Result.error(new RoomNotFoundError(roomId));

		await this.roomRepository.delete(room);
		return Result.success({} as never);
	}
}
