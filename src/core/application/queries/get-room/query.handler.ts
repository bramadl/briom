import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetRoomInput, GetRoomOutput, GetRoomQuery } from "./query";

/**
 * @description
 * `GetRoomHandler` — Query Handler
 *
 * Thin wrapper around `GetRoomQuery` enforcing the `IQuery` contract.
 * Converts raw query output into a `Result` for consistency with command
 * handlers across the application layer.
 *
 * @see GetRoomQuery — for data retrieval logic
 * @see DrizzleGetRoomQuery — infrastructure implementation
 */
export class GetRoomHandler
	implements IQuery<GetRoomInput, GetRoomOutput, never>
{
	public constructor(private readonly query: GetRoomQuery) {}

	public async execute(
		input: GetRoomInput,
	): Promise<IResult<GetRoomOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
