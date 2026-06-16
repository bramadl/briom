import { Room, RoomId, type RoomRepository } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/drimion";

import type { CreateRoomCommand, CreateRoomOutput } from "./command";

export class CreateRoomHandler
	implements ICommand<CreateRoomCommand, CreateRoomOutput, DomainError>
{
	public constructor(private readonly roomRepository: RoomRepository) {}

	public async execute({
		input,
	}: CreateRoomCommand): Promise<IResult<CreateRoomOutput, DomainError>> {
		const roomResult = Room.create({
			id: RoomId(crypto.randomUUID()),
			title: input.title,
			createdAt: new Date(),
		});

		if (roomResult.isError()) return Result.error(roomResult.error());

		const room = roomResult.value();
		await this.roomRepository.save(room);

		return Result.success({ roomId: room.id.value() });
	}
}
