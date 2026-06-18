import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetRoomInput, GetRoomOutput, GetRoomQuery } from "./query";

/**
 * @description
 * `GetRoomHandler` — Query Handler
 *
 * Thin wrapper around `GetRoomQuery` that enforces the `IQuery` contract.
 * Converts raw query output into a `Result` for consistency with command handlers.
 *
 * **Why So Thin?**
 * Query handlers should be pass-through. Complex logic belongs in the query
 * implementation (infra layer) or the domain. The handler's only job is
 * standardizing the return shape (Result) and enabling dependency injection.
 *
 * @see GetRoomQuery — for the actual data retrieval logic
 */
export class GetRoomHandler implements IQuery<GetRoomInput, GetRoomOutput> {
	public constructor(private readonly query: GetRoomQuery) {}

	/**
	 * @description
	 * Executes the room lookup query.
	 *
	 * @param input - Room ID to retrieve
	 * @returns Result wrapping the room DTO
	 */
	public async execute(input: GetRoomInput): Promise<IResult<GetRoomOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
