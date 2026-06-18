import { ModeratorId, Room, RoomId, type RoomRepository } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { FormRoomCommand, FormRoomOutput } from "./command";

export class FormRoomHandler
	implements ICommand<FormRoomCommand, FormRoomOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: FormRoomCommand,
	): Promise<IResult<FormRoomOutput, DomainError>> {
		const { title, moderatorId } = command.input;

		const result = Room.form({
			id: RoomId(),
			title,
			moderatorId: ModeratorId(moderatorId),
			createdAt: new Date(),
		});

		if (result.isError()) return Result.error(result.error());

		const room = result.value();
		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success({ roomId: room.id.value() });
	}
}
