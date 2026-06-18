import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetRoomsInput, GetRoomsOutput, GetRoomsQuery } from "./query";

/**
 * @description
 * `GetRoomsHandler` — Query Handler
 *
 * Thin wrapper around `GetRoomsQuery` enforcing `IQuery` contract.
 * Returns all rooms as a `Result` for consistency with command handlers.
 *
 * @see GetRoomsQuery — for data retrieval logic
 */
export class GetRoomsHandler
	implements IQuery<GetRoomsInput, GetRoomsOutput, never>
{
	public constructor(private readonly query: GetRoomsQuery) {}

	/**
	 * @description
	 * Executes the rooms list query.
	 *
	 * @param input - Empty criteria (reserved for future filtering)
	 * @returns Result wrapping all rooms
	 */
	public async execute(
		input: GetRoomsInput,
	): Promise<IResult<GetRoomsOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
