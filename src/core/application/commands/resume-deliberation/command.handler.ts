import {
	type CannotResumeRoomError,
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

import type { ResumeDeliberationCommand } from "./command";

export class ResumeDeliberationHandler
	implements ICommand<ResumeDeliberationCommand, void, CannotResumeRoomError>
{
	constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: ResumeDeliberationCommand,
	): Promise<IResult<void, CannotResumeRoomError>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "ResumeDeliberation" }),
			);
		}

		const result = room.resume();
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success(undefined);
	}
}
