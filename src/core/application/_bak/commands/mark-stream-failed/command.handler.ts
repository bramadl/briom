import {
	RoomId,
	TurnId,
	TurnNotFoundError,
	type TurnRepository,
} from "@briom/core/domain";
import { type ICommand, type IResult, Result } from "@briom/libs/drimion";

import type {
	MarkStreamFailedCommand,
	MarkStreamFailedOutput,
} from "./command";

export class MarkStreamFailedHandler
	implements
		ICommand<MarkStreamFailedCommand, MarkStreamFailedOutput, TurnNotFoundError>
{
	public constructor(private readonly turnRepository: TurnRepository) {}

	public async execute({
		input,
	}: MarkStreamFailedCommand): Promise<IResult<never, TurnNotFoundError>> {
		const roomId = RoomId(input.roomId);
		const turnId = TurnId(input.turnId);

		const turn = await this.turnRepository.getByRoom(roomId, turnId);
		if (!turn) return Result.error(new TurnNotFoundError(turnId));

		turn.markAsFailed();
		await this.turnRepository.save(turn);

		return Result.success({} as never);
	}
}
