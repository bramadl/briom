import { type IQuery, type IResult, Result } from "@drimion";

import type { GetRoomsOutput, GetRoomsQuery, IGetRoomsQuery } from "./query";

/**
 * @description
 * `GetRoomsHandler` — Query Handler
 *
 * Thin wrapper around `IGetRoomsQuery` enforcing the `IQuery` contract.
 * Unwraps the `GetRoomsQuery` message's `.input` and converts raw query
 * output into a `Result`, for consistency with command handlers across
 * the application layer.
 *
 * @see IGetRoomsQuery — for data retrieval logic
 * @see DrizzleGetRoomsQuery — infrastructure implementation
 */
export class GetRoomsHandler
	implements IQuery<GetRoomsQuery, GetRoomsOutput, never>
{
	public constructor(private readonly query: IGetRoomsQuery) {}

	public async execute({
		input,
	}: GetRoomsQuery): Promise<IResult<GetRoomsOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
