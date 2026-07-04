import {
	type IModeratorRepository,
	ModeratorId,
	ModeratorPolicy,
} from "@briom/core/domain";
import { type IQuery, type IResult, Result } from "@drimion";

import type {
	GetModeratorMetadata,
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
	implements
		IQuery<GetModeratorQuery, GetModeratorOutput, never, GetModeratorMetadata>
{
	public constructor(
		private readonly query: IGetModeratorQuery,
		private readonly moderatorRepository: IModeratorRepository,
	) {}

	public async execute({
		input,
	}: GetModeratorQuery): Promise<
		IResult<GetModeratorOutput, never, GetModeratorMetadata>
	> {
		const output = await this.query.execute(input);

		const moderator = await this.moderatorRepository.findById(
			ModeratorId(input.moderatorId),
		);

		const limit: GetModeratorMetadata["limit"] = {
			maximumAttachmentPerRoom: ModeratorPolicy.default.attachmentsPerRoom,
			maximumParticipantPerRoom: ModeratorPolicy.default.participantsPerRoom,
			maximumRoom: ModeratorPolicy.default.rooms,
		};

		if (moderator) {
			const { maximumAttachments, maximumParticipantsPerRoom, maximumRooms } =
				new ModeratorPolicy(moderator);

			limit.maximumAttachmentPerRoom = maximumAttachments;
			limit.maximumParticipantPerRoom = maximumParticipantsPerRoom;
			limit.maximumRoom = maximumRooms;
		}

		return Result.success(output, { limit });
	}
}
