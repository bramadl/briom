import { type IQuery, type IResult, Result } from "@drimion";

import type { GetTurnOutput, GetTurnQuery, IGetTurnQuery } from "./query";

/**
 * @description
 * `GetTurnHandler` — Query Handler
 *
 * Thin wrapper around `IGetTurnQuery` enforcing `IQuery` contract.
 * Unwraps the `GetTurnQuery` message's `.input` and returns a single
 * turn as a `Result`, for consistency with command handlers.
 *
 * @see IGetTurnQuery — for data retrieval logic
 * @see DrizzleGetTurnQuery — infrastructure implementation
 */
export class GetTurnHandler
	implements IQuery<GetTurnQuery, GetTurnOutput, never>
{
	public constructor(private readonly query: IGetTurnQuery) {}

	public async execute({
		input,
	}: GetTurnQuery): Promise<IResult<GetTurnOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
