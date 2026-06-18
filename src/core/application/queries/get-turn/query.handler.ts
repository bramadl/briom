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
export class GetTurnHandler implements IQuery<GetTurnInput, GetTurnOutput> {
	public constructor(private readonly query: GetTurnQuery) {}

	/**
	 * @description
	 * Executes the single turn lookup query.
	 *
	 * @param input - Turn ID to retrieve
	 * @returns Result wrapping the turn DTO
	 */
	public async execute(input: GetTurnInput): Promise<IResult<GetTurnOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
