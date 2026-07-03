import {
	type IRoomRepository,
	type ITurnRepository,
	ModeratorId,
	RoomId,
	type Turn,
	TurnId,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@drimion";

import type { ITurnGenerator } from "../../../ports/generators/turn.generator";

import type { RetryTurnCommand, RetryTurnOutput } from "./command";

/**
 * @description
 * Application-layer command handler responsible for retrying a failed
 * turn.
 *
 * Resolves the Turn, verifies moderator ownership, transitions the turn
 * back out of its failed state, persists the aggregate, publishes domain
 * events, and re-enqueues execution — the domain method itself is the
 * single source of truth for whether a retry is actually valid from the
 * turn's current state, so this handler never re-checks `isFailed` before
 * calling it.
 */
export class RetryTurnHandler
	implements ICommand<RetryTurnCommand, RetryTurnOutput, ApplicationError>
{
	public constructor(
		private readonly roomRepository: IRoomRepository,
		private readonly turnRepository: ITurnRepository,
		private readonly turnGenerator: ITurnGenerator,
		private readonly eventBus: IEventBus,
	) {}

	public async execute({
		input,
	}: RetryTurnCommand): Promise<IResult<RetryTurnOutput, ApplicationError>> {
		const moderatorId = ModeratorId(input.moderatorId);
		const roomId = RoomId(input.roomId);
		const turnId = TurnId(input.turnId);

		const turnResult = await this.resolveTurnAndAuthorize(
			moderatorId,
			roomId,
			turnId,
		);

		if (turnResult.isError()) return Result.error(turnResult.error());
		const turn = turnResult.value();

		const retryResult = turn.retry();
		if (retryResult.isError()) {
			const domainError = retryResult.error();
			return Result.error(
				ApplicationError.conflict(domainError.message).causedBy(domainError),
			);
		}

		await this.persistAndPublish(turn);
		await this.turnGenerator.enqueue(turn.get("roomId"), turn.id);

		return Result.success(this.buildOutput());
	}

	/**
	 * @description
	 * Resolves this handler's context and performs authorization against
	 * the requesting moderator — both that the moderator owns the room,
	 * and that the turn actually belongs to the room the caller claims.
	 */
	private async resolveTurnAndAuthorize(
		moderatorId: ModeratorId,
		roomId: RoomId,
		turnId: TurnId,
	): Promise<IResult<Turn, ApplicationError>> {
		const [room, turn] = await Promise.all([
			this.roomRepository.findById(roomId),
			this.turnRepository.findById(turnId),
		]);

		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found.").withCode(
					"ROOM_NOT_FOUND_ERROR",
				),
			);
		}

		if (!turn) {
			return Result.error(
				ApplicationError.notFound("Turn not found.").withCode(
					"TURN_NOT_FOUND_ERROR",
				),
			);
		}

		if (
			!room.get("moderatorId").isEqual(moderatorId) ||
			!turn.get("roomId").isEqual(roomId)
		) {
			return Result.error(ApplicationError.forbidden());
		}

		return Result.success(turn);
	}

	/**
	 * @description
	 * Persists the retried turn and publishes the domain events it
	 * accumulated from the state transition.
	 */
	private async persistAndPublish(turn: Turn): Promise<void> {
		await this.turnRepository.persist(turn);
		await this.eventBus.publishAll(turn.pullEvents());
	}

	/**
	 * @description
	 * Shapes the handler's outcome into the response FE renders.
	 */
	private buildOutput(): RetryTurnOutput {
		return { timestamp: Math.floor(Date.now() / 1000) };
	}
}
