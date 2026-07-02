import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetRoomsInput, GetRoomsOutput, GetRoomsQuery } from "./query";

/**
 * @description
 * `GetRoomsHandler` — Query Handler
 *
 * Thin wrapper around `GetRoomsQuery` enforcing the `IQuery` contract.
 * Converts raw query output into a `Result` for consistency with command
 * handlers across the application layer.
 *
 * @see GetRoomsQuery — for data retrieval logic
 * @see DrizzleGetRoomsQuery — infrastructure implementation
 */
export class GetRoomsHandler
	implements IQuery<GetRoomsInput, GetRoomsOutput, never>
{
	public constructor(private readonly query: GetRoomsQuery) {}

	public async execute(
		input: GetRoomsInput,
	): Promise<IResult<GetRoomsOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
