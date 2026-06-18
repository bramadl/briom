import {
	ModeratorId,
	RoomId,
	type RoomRepository,
	TurnId,
	type TurnSequencer,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type {
	InitiateModeratorTurnCommand,
	InitiateModeratorTurnOutput,
} from "./command";

/**
 * @description
 * `InitiateModeratorTurnHandler` — Command Handler
 *
 * Executes the creation of a moderator turn.
 *
 * **Flow**
 * 1. Find room by ID
 * 2. Verify room is deliberating
 * 3. Generate next sequence number
 * 4. Delegate to `TurnLifecycleOrchestrator.initiateModeratorTurn()`
 * 5. Register turn in room
 * 6. Persist room and turn
 * 7. Publish all domain events
 *
 * **Why Orchestrator?**
 * Moderator turns skip LLM streaming but still need lifecycle management
 * (persist, events, room registration). The orchestrator provides uniform
 * handling regardless of turn type.
 *
 * **Events Published**
 * - `TurnInitiated` — signals new turn slot
 * - `TurnSettled` — signals moderator content is available (immediate)
 * - `TurnRegistered` — signals room has new turn in history
 *
 * @see TurnLifecycleOrchestrator — for lifecycle coordination
 * @see TurnSseSubscriber — for event forwarding
 */
export class InitiateModeratorTurnHandler
	implements
		ICommand<
			InitiateModeratorTurnCommand,
			InitiateModeratorTurnOutput,
			DomainError
		>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly sequencer: TurnSequencer,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly eventBus: IEventBus,
	) {}

	/**
	 * @description
	 * Creates a moderator turn with human content.
	 *
	 * @param command - Room ID, moderator ID, and content
	 * @returns Result containing turnId, or domain error
	 */
	public async execute(
		command: InitiateModeratorTurnCommand,
	): Promise<IResult<InitiateModeratorTurnOutput, DomainError>> {
		const { roomId, moderatorId, content } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "InitiateModeratorTurn" }),
			);
		}

		if (!room.isDeliberating) {
			return Result.error(
				new DomainError("Room is not deliberating", {
					context: "InitiateModeratorTurn",
				}),
			);
		}

		const nextSequence = await this.sequencer.nextPositionInside(room);
		const result = await this.orchestrator.initiateModeratorTurn({
			id: TurnId(),
			roomId: RoomId(roomId),
			sequence: nextSequence,
			moderatorId: ModeratorId(moderatorId),
			content,
		});

		if (result.isError()) return Result.error(result.error());

		const turn = result.value();
		room.registerTurn(turn.id);

		await this.roomRepository.persist(room);

		const turnEvents = turn.pullEvents();
		const roomEvents = room.pullEvents();
		await this.eventBus.publishAll([...turnEvents, ...roomEvents]);

		return Result.success({ turnId: turn.id.value() });
	}
}
