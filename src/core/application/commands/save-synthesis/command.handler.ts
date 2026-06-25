import { RoomId, type RoomRepository } from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { SaveSynthesisCommand, SaveSynthesisOutput } from "./command";

/**
 * @description
 * `SaveSynthesisHandler` — Command Handler
 *
 * Persists completed synthesis content to the room aggregate.
 *
 * **Guard**: Room must have a prior synthesis in-flight (status === "pending").
 * If the synthesis was not initiated or was already saved/failed, returns error.
 */
export class SaveSynthesisHandler
	implements ICommand<SaveSynthesisCommand, SaveSynthesisOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: SaveSynthesisCommand,
	): Promise<IResult<SaveSynthesisOutput, DomainError>> {
		const { roomId, content, createdBy } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", {
					context: "SaveSynthesis",
				}),
			);
		}

		const result = room.saveSynthesis(content, createdBy);
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success({ roomId: room.id.value() });
	}
}
