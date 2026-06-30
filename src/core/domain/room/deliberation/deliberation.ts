import { type DomainError, type IResult, Result } from "@briom/libs/drimion";

import type { Room } from "../room";
import { type Turn, TurnIntent } from "../turn";

import type {
	NextSequenceTurnInput,
	NextSequenceTurnOutput,
} from "./deliberation.sequence-turn";
import {
	NoParticipantsAvailableError,
	ParticipantNotFoundError,
} from "./errors";

/**
 * @description
 * `RoomDeliberationService` — Domain Service
 *
 * Decides who speaks next after a moderator turn, given the Room's current
 * participants and turn history. Single source of truth for sequencing
 * logic that previously lived scattered across FE hooks (mention parsing,
 * round-robin selection, manual three-command orchestration).
 *
 * Pure and deterministic by default: given the same `room`, `turns`, and
 * `input`, `decideNextResponder` always returns the same decision (except
 * for the injectable `random` used in round-robin selection, which can be
 * pinned in tests). It has no dependency on any repository, port, or
 * side-effecting abstraction — it reads data it's given and returns a
 * decision, nothing more.
 *
 * **What this service does NOT do:**
 * - Claim or release the Room's turn slot → `Room.claimTurnSlot`/`releaseTurnSlot`
 * - Create or persist Turn aggregates → application layer command handler
 * - Publish domain events → application layer command handler
 *
 * Selection rules, in priority order:
 * 1. Explicit @mention present → that Participant, DIRECT intent.
 * 2. No mention, single-participant room → the only Participant, RESPOND intent.
 * 3. No mention, multi-participant room → round-robin, excluding whoever
 *    spoke last to encourage perspective diversity.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <DomainService>
export class DeliberationService {
	/**
	 * @description
	 * Decides which Participant should speak next and with what intent.
	 *
	 * @param room
	 * The Room whose roster is consulted for candidate participants.
	 *
	 * @param turns
	 * The Room's turn history, used to determine who spoke last for
	 * round-robin exclusion.
	 *
	 * @param input
	 * Mention and multi-deliberation context for this specific decision.
	 *
	 * @param random
	 * Source of randomness for round-robin candidate selection. Defaults
	 * to `Math.random`; inject a deterministic function in tests.
	 */
	public static decideNextResponder(
		room: Room,
		turns: Turn[],
		input: NextSequenceTurnInput,
		random: () => number = Math.random,
	): IResult<NextSequenceTurnOutput, DomainError> {
		const { mentionedParticipantIds, multiDeliberation } = input;
		if (mentionedParticipantIds.length > 0) {
			const mentioned = room.findParticipantById(mentionedParticipantIds[0]);
			if (!mentioned) {
				return Result.error(new ParticipantNotFoundError());
			}

			return Result.success({
				nextResponderId: mentioned.id,
				intent: TurnIntent.DIRECT,
			});
		}

		const participants = room.get("participants");
		if (!multiDeliberation) {
			const [only] = participants;
			if (!only) {
				return Result.error(new NoParticipantsAvailableError());
			}

			return Result.success({
				nextResponderId: only.id,
				intent: TurnIntent.RESPOND,
			});
		}

		const lastSpeakerId = turns.findLast(
			(t) => t.isFromParticipant,
		)?.participantId;

		const pool = participants.filter(
			(p) => !lastSpeakerId || !p.id.isEqual(lastSpeakerId),
		);

		const candidates = pool.length > 0 ? pool : participants;
		if (candidates.length === 0) {
			return Result.error(new NoParticipantsAvailableError());
		}

		const picked = candidates[Math.floor(random() * candidates.length)];
		return Result.success({
			nextResponderId: picked.id,
			intent: TurnIntent.RESPOND,
		});
	}
}
