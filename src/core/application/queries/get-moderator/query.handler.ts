import { type IQuery, type IResult, Result } from "@drimion";

import type {
	GetModeratorOutput,
	GetModeratorQuery,
	IGetModeratorQuery,
} from "./query";

/**
 * @description
 * `GetModeratorHandler` — Query Handler
 *
 * Thin wrapper around `IGetModeratorQuery` enforcing the `IQuery` contract.
 * Unwraps the `GetModeratorQuery` message's `.input` and converts raw query
 * output into a `Result`, for consistency with command handlers across
 * the application layer.
 *
 * @see IGetModeratorQuery — for data retrieval logic
 * @see DrizzleGetModeratorQuery — infrastructure implementation
 */
export class GetModeratorHandler
	implements IQuery<GetModeratorQuery, GetModeratorOutput, never>
{
	public constructor(private readonly query: IGetModeratorQuery) {}

	public async execute({
		input,
	}: GetModeratorQuery): Promise<IResult<GetModeratorOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
