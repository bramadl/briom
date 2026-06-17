import {
	RoomId,
	TurnId,
	TurnNotDeletableError,
	TurnNotFoundError,
	type TurnRepository,
} from "@briom/core/domain";
import { type ICommand, type IResult, Result } from "@briom/libs/drimion";

import type { DeleteTurnCommand, DeleteTurnOutput } from "./command";

export class DeleteTurnHandler
	implements
		ICommand<
			DeleteTurnCommand,
			DeleteTurnOutput,
			TurnNotFoundError | TurnNotDeletableError
		>
{
	public constructor(private readonly turnRepository: TurnRepository) {}

	public async execute({
		input,
	}: DeleteTurnCommand): Promise<
		IResult<DeleteTurnOutput, TurnNotFoundError | TurnNotDeletableError>
	> {
		const roomId = RoomId(input.roomId);
		const turnId = TurnId(input.turnId);

		const deleted = await this.turnRepository.delete(roomId, turnId);
		if (deleted) return Result.success({} as never);

		const turn = await this.turnRepository.getByRoom(roomId, turnId);
		if (!turn) return Result.error(new TurnNotFoundError(turnId));

		return Result.error(new TurnNotDeletableError(turnId));
	}
}
