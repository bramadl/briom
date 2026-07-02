import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetTurnInput, GetTurnOutput, GetTurnQuery } from "./query";

/**
 * @description
 * `GetTurnHandler` — Query Handler
 *
 * Thin wrapper around `GetTurnQuery` enforcing `IQuery` contract.
 * Returns a single turn as a Result for consistency with command handlers.
 *
 * @see GetTurnQuery — for data retrieval logic
 */
export class GetTurnHandler
	implements IQuery<GetTurnInput, GetTurnOutput, never>
{
	public constructor(private readonly query: GetTurnQuery) {}

	public async execute(
		input: GetTurnInput,
	): Promise<IResult<GetTurnOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
