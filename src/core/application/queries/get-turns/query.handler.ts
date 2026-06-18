import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetTurnsInput, GetTurnsOutput, GetTurnsQuery } from "./query";

/**
 * @description
 * `GetTurnsHandler` — Query Handler
 *
 * Thin wrapper around `GetTurnsQuery` enforcing `IQuery` contract.
 * Returns all room turns as a Result for consistency with command handlers.
 *
 * @see GetTurnsQuery — for data retrieval logic
 */
export class GetTurnsHandler implements IQuery<GetTurnsInput, GetTurnsOutput> {
	public constructor(private readonly query: GetTurnsQuery) {}

	/**
	 * @description
	 * Executes the turns list query.
	 *
	 * @param input - Room ID to retrieve turns for
	 * @returns Result wrapping all turns in sequence order
	 */
	public async execute(input: GetTurnsInput): Promise<IResult<GetTurnsOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
