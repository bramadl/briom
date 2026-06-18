import {
	type CannotStartDeliberationError,
	type EmptyTopicError,
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

import type { StartDeliberationCommand } from "./command";

export class StartDeliberationHandler
	implements
		ICommand<
			StartDeliberationCommand,
			void,
			EmptyTopicError | CannotStartDeliberationError
		>
{
	constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: StartDeliberationCommand,
	): Promise<IResult<void, EmptyTopicError | CannotStartDeliberationError>> {
		const { roomId, topic } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "StartDeliberation" }),
			);
		}

		const result = room.startDeliberation(topic);
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success(undefined);
	}
}
