import {
	type IModeratorRepository,
	ModeratorId,
	ModeratorPolicy,
} from "@briom/core/domain";
import { type IQuery, type IResult, Result } from "@drimion";

import type {
	GetRoomsMetadata,
	GetRoomsOutput,
	GetRoomsQuery,
	IGetRoomsQuery,
} from "./query";

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
	implements IQuery<GetRoomsQuery, GetRoomsOutput, never, GetRoomsMetadata>
{
	public constructor(
		private readonly query: IGetRoomsQuery,
		private readonly moderatorRepository: IModeratorRepository,
	) {}

	public async execute({
		input,
	}: GetRoomsQuery): Promise<IResult<GetRoomsOutput, never, GetRoomsMetadata>> {
		const output = await this.query.execute(input);
		const total = output.rooms.length;

		let canOpenMoreRoom = true;
		let quotaLeft = Infinity;

		const moderator = await this.moderatorRepository.findById(
			ModeratorId(input.moderatorId),
		);

		if (moderator) {
			const policy = new ModeratorPolicy(moderator);
			canOpenMoreRoom = policy.canFormRoom(output.rooms.length);
			quotaLeft = policy.maximumRooms - total;
		}

		return Result.success(output, { canOpenMoreRoom, quotaLeft, total });
	}
}
