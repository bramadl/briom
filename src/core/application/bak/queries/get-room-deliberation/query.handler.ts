import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type {
	GetRoomDeliberationInput,
	GetRoomDeliberationOutput,
	GetRoomDeliberationQuery,
} from "./query";

/**
 * @description
 * `GetRoomDeliberationHandler` — Query Handler
 *
 * Thin wrapper around `GetRoomDeliberationQuery` enforcing the `IQuery` contract.
 * Converts raw query output into a `Result` for consistency with command
 * handlers across the application layer.
 *
 * @see GetRoomDeliberationQuery — for data retrieval logic
 * @see DrizzleGetRoomDeliberationQuery — infrastructure implementation
 */
export class GetRoomDeliberationHandler
	implements IQuery<GetRoomDeliberationInput, GetRoomDeliberationOutput, never>
{
	public constructor(private readonly query: GetRoomDeliberationQuery) {}

	public async execute(
		input: GetRoomDeliberationInput,
	): Promise<IResult<GetRoomDeliberationOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
