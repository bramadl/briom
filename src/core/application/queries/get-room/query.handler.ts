import {
	type IModeratorRepository,
	ModeratorId,
	ModeratorPolicy,
} from "@briom/core/domain";
import { type IQuery, type IResult, Result } from "@drimion";

import type {
	GetRoomMetadata,
	GetRoomOutput,
	GetRoomQuery,
	IGetRoomQuery,
} from "./query";

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
	implements IQuery<GetRoomQuery, GetRoomOutput, never, GetRoomMetadata>
{
	public constructor(
		private readonly query: IGetRoomQuery,
		private readonly moderatorRepository: IModeratorRepository,
	) {}

	public async execute({
		input,
	}: GetRoomQuery): Promise<IResult<GetRoomOutput, never, GetRoomMetadata>> {
		const output = await this.query.execute(input);

		let canAttachFile = false;
		let canInviteParticipant = false;

		const moderator = await this.moderatorRepository.findById(
			ModeratorId(input.moderatorId),
		);

		if (moderator) {
			const policy = new ModeratorPolicy(moderator);
			if (output.room) {
				canAttachFile =
					policy.canAttachFile(output.room.info.attachments.length) &&
					output.room.info.metadata.status === "forming";

				canInviteParticipant = policy.canInviteParticipant(
					output.room.info.participants.length,
				);
			}
		}

		return Result.success(output, { canAttachFile, canInviteParticipant });
	}
}
