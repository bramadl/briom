import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type {
	GetRoomsOverviewInput,
	GetRoomsOverviewOutput,
	GetRoomsOverviewQuery,
} from "./query";

/**
 * @description
 * `GetRoomsOverviewHandler` — Query Handler
 *
 * Thin wrapper around `GetRoomsOverviewQuery` enforcing the `IQuery` contract.
 * Converts raw query output into a `Result` for consistency with command
 * handlers across the application layer.
 *
 * @see GetRoomsOverviewQuery — for data retrieval logic
 * @see DrizzleGetRoomsOverviewQuery — infrastructure implementation
 */
export class GetRoomsOverviewHandler
	implements IQuery<GetRoomsOverviewInput, GetRoomsOverviewOutput, never>
{
	public constructor(private readonly query: GetRoomsOverviewQuery) {}

	public async execute(
		input: GetRoomsOverviewInput,
	): Promise<IResult<GetRoomsOverviewOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
