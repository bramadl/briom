import { type IQuery, type IResult, Result } from "@drimion";

import type { GetRoomOutput, GetRoomQuery, IGetRoomQuery } from "./query";

/**
 * @description
 * `GetRoomHandler` — Query Handler
 *
 * Thin wrapper around `IGetRoomQuery` enforcing the `IQuery` contract.
 * Unwraps the `GetRoomQuery` message's `.input` and converts raw query
 * output into a `Result`, for consistency with command handlers and
 * every other query handler across the application layer.
 *
 * @see IGetRoomQuery — for data retrieval logic
 * @see DrizzleGetRoomQuery — infrastructure implementation
 */
export class GetRoomHandler
	implements IQuery<GetRoomQuery, GetRoomOutput, never>
{
	public constructor(private readonly query: IGetRoomQuery) {}

	public async execute({
		input,
	}: GetRoomQuery): Promise<IResult<GetRoomOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
