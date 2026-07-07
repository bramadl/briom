import {
	type IRoomRepository,
	type ITurnRepository,
	ModeratorId,
	ProposalGenerator,
	RoomId,
} from "@briom/core/domain";
import { type IQuery, type IResult, Result } from "@drimion";

import type { GetProposalsOutput, GetProposalsQuery } from "./query";

/**
 * @description
 * `GetProposalsHandler` — Query Handler
 *
 * Thin wrapper around `GetProposalsQuery` enforcing the `IQuery` contract.
 * Converts raw query output into a `Result` for consistency with command
 * handlers across the application layer.
 *
 * @see GetProposalsQuery — for proposal generation logic
 * @see ProposalGenerator.proposeNextTurns — domain logic
 */
export class GetProposalsHandler
	implements IQuery<GetProposalsQuery, GetProposalsOutput, never>
{
	public constructor(
		private readonly roomRepository: IRoomRepository,
		private readonly turnRepository: ITurnRepository,
	) {}

	public async execute({
		input,
	}: GetProposalsQuery): Promise<IResult<GetProposalsOutput, never>> {
		const roomId = RoomId(input.roomId);

		const [room, turns] = await Promise.all([
			this.roomRepository.findById(roomId),
			this.turnRepository.findByRoomId(roomId),
		]);

		if (!room) return Result.success({ proposals: [] });
		if (!room.get("moderatorId").isEqual(ModeratorId(input.moderatorId))) {
			return Result.success({ proposals: [] });
		}

		const proposals = ProposalGenerator.proposeNextTurns({
			participants: room.get("participants"),
			room,
			turns,
		});

		return Result.success({
			proposals: proposals.map((p) => ({
				confidence: p.confidence,
				intent: p.intent,
				label: p.rationale,
				name:
					room.findParticipantById(p.participantId)?.get("displayName") ??
					"Participant",
				participantId: p.participantId.value(),
			})),
		});
	}
}
