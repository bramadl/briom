import { RoomId, type RoomRepository } from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { FailSynthesisCommand, FailSynthesisOutput } from "./command";

/**
 * @description
 * `FailSynthesisHandler` — Command Handler
 *
 * Marks an in-flight synthesis as failed. Idempotent — safe to call
 * even if synthesis is not in progress (no-op).
 */
export class FailSynthesisHandler
	implements ICommand<FailSynthesisCommand, FailSynthesisOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: FailSynthesisCommand,
	): Promise<IResult<FailSynthesisOutput, DomainError>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", {
					context: "FailSynthesis",
				}),
			);
		}

		room.failSynthesis();

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success({ roomId: room.id.value() });
	}
}
