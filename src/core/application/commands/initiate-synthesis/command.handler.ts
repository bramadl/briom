import { RoomId, type RoomRepository } from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type {
	InitiateSynthesisCommand,
	InitiateSynthesisOutput,
} from "./command";

/**
 * @description
 * `InitiateSynthesisHandler` — Command Handler
 *
 * Validates that synthesis can be initiated, then delegates to the Room aggregate.
 * Ensures idempotency — only one synthesis can be in flight at a time per room.
 *
 * **Human-Led Principle**
 * The moderator explicitly chooses when to synthesize (post-conclusion).
 * This handler only enforces the guard; it doesn't autonomously decide.
 */
export class InitiateSynthesisHandler
	implements
		ICommand<InitiateSynthesisCommand, InitiateSynthesisOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: InitiateSynthesisCommand,
	): Promise<IResult<InitiateSynthesisOutput, DomainError>> {
		const { roomId } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", {
					context: "InitiateSynthesis",
				}),
			);
		}

		const result = room.initiateSynthesis();
		if (result.isError()) return Result.error(result.error());

		await this.roomRepository.persist(room);

		const events = room.pullEvents();
		await this.eventBus.publishAll(events);

		return Result.success({ roomId: room.id.value() });
	}
}
