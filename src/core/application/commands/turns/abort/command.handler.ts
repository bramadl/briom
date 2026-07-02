import {
	type IRoomRepository,
	type ITurnAbortSignal,
	type ITurnRepository,
	ModeratorId,
	RoomId,
	type Turn,
	TurnId,
} from "@briom/domain";
import {
	ApplicationError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { AbortTurnCommand, AbortTurnOutput } from "./command";

/**
 * @description
 * Application-layer command handler responsible for aborting an on-going
 * participant turn (streaming).
 *
 * Resolves the Turn, verifies moderator ownership, request abort signal,
 * persists the aggregate, and publishes domain events.
 */
export class AbortTurnHandler
	implements ICommand<AbortTurnCommand, AbortTurnOutput, ApplicationError>
{
	public constructor(
		private readonly roomRepository: IRoomRepository,
		private readonly turnRepository: ITurnRepository,
		private readonly turnAbortSignal: ITurnAbortSignal,
	) {}

	public async execute({
		input,
	}: AbortTurnCommand): Promise<IResult<AbortTurnOutput, ApplicationError>> {
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

		if (!turn.canAbort) {
			return Result.error(
				ApplicationError.conflict(
					"The requested turn cannot be aborted.",
				).withCode("CANNOT_ABORT_PARTICIPANT_TURN_ERROR"),
			);
		}

		await this.turnAbortSignal.request(turn.id);

		const output = this.buildOutput();
		return Result.success(output);
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
	 * Shapes the handler's outcome into the response FE renders.
	 */
	private buildOutput(): AbortTurnOutput {
		return { timestamp: Math.floor(Date.now() / 1000) };
	}
}
