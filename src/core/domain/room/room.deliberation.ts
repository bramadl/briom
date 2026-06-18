import { type IResult, Result } from "@briom/libs/drimion";

import {
	INTENT_OPTION,
	InvalidIntentForContextError,
	type Turn,
	TurnIntent,
} from "../turn";

import type { Participant, ParticipantId } from "./participant";
import type { Room } from "./room";

/**
 * @description
 * Input context for deliberation validation and proposal generation.
 */
type ParticipantIntent = {
	participantId: ParticipantId;
	intent: TurnIntent;
};

/**
 * @description
 * Context bundle containing all state needed to evaluate intent validity
 * or generate turn proposals within a room.
 */
export interface DeliberationContext {
	participants: Participant[];
	room: Room;
	turns: Turn[];
}

/**
 * @description
 * Proposed next turn with confidence scoring and rationale.
 *
 * Used by the application layer to optionally suggest which participant
 * should speak next, while preserving human-led orchestration (the moderator
 * always has final authority on who speaks).
 */
export interface TurnProposal {
	confidence: number;
	intent: TurnIntent;
	participantId: ParticipantId;
	rationale: string;
}

/**
 * @description
 * `RoomDeliberation` — Domain Service
 *
 * Encapsulates deliberation rules that span multiple aggregates (`Room`, `Turn`)
 * or require complex evaluation of turn history. Unlike the `Room` aggregate which
 * guards its own invariants, this service evaluates cross-cutting concerns:
 *
 * - Intent validation: Is a participant's requested intent valid given context?
 * - Turn proposal: Which participants might contribute next, and how?
 *
 * **Why a Domain Service, not Aggregate method?**
 * These rules need read-only access to turn history and cross-aggregate data.
 * Putting them in Room would bloat the aggregate with query logic; putting them
 * in application would leak domain rules outward.
 *
 * **Human-Led Principle**
 * All proposals are suggestions. The moderator decides whether to act on them.
 * This service never autonomously initiates turns.
 */
export class RoomDeliberation {
	/**
	 * @description
	 * Validates whether a participant's intent is appropriate given current deliberation state.
	 *
	 * **Rules**:
	 * - `SUMMARIZE` requires at least 2 settled turns (needs substance to synthesize)
	 * - `CRITIQUE/CHALLENGE` require a previous participant turn to respond to
	 * - Participant must actually be in the room
	 *
	 * @param context - Current deliberation state (room, turns, participants)
	 * @param participantIntent - The intent and participant to validate
	 * @returns Result containing void or InvalidIntentForContextError
	 */
	public validateIntent(
		context: DeliberationContext,
		{ intent, participantId }: ParticipantIntent,
	): IResult<void, InvalidIntentForContextError> {
		const { room, turns } = context;

		if (intent.toSummarize) {
			const settledCount = turns.filter((t) => t.isSettled).length;
			if (settledCount < 2) {
				return Result.error(
					new InvalidIntentForContextError(
						intent,
						"requires at least 2 settled turns to summarize",
					),
				);
			}
		}

		if (intent.toCritique || intent.toChallenge) {
			const hasNoPreviousParticipantTurn = !turns
				.slice(0, -1)
				.some((t) => t.isFromParticipant && t.isSettled);

			if (hasNoPreviousParticipantTurn) {
				return Result.error(
					new InvalidIntentForContextError(
						intent,
						"no previous participant perspective to critique",
					),
				);
			}
		}

		const participantNotInRoom = !room
			.get("participants")
			.some((p) => p.id.isEqual(participantId));

		if (participantNotInRoom) {
			return Result.error(
				new InvalidIntentForContextError(intent, "participant not in room"),
			);
		}

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Generates turn proposals for eligible participants.
	 *
	 * Suggests which participants could speak next and with what intent,
	 * ranked by confidence. Excludes the most recent speaker to encourage
	 * perspective diversity.
	 *
	 * @param context - Current deliberation state
	 * @returns Array of proposals, sorted by confidence descending, limited to top 4
	 */
	public proposeNextTurns(context: DeliberationContext): TurnProposal[] {
		const { room, turns, participants } = context;
		if (!room.isDeliberating) return [];

		const proposals: TurnProposal[] = [];
		const lastTurn = turns[turns.length - 1];
		const lastParticipantId = lastTurn?.participantId;

		for (const participant of participants) {
			if (lastParticipantId && participant.id.isEqual(lastParticipantId)) {
				continue;
			}

			const intents = this.suggestIntentsForParticipant(
				context,
				participant.id,
			);

			for (const intent of intents) {
				proposals.push({
					participantId: participant.id,
					intent,
					rationale: this.generateRationale(context, participant.id, intent),
					confidence: this.calculateConfidence(context, participant.id, intent),
				});
			}
		}

		return proposals.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
	}

	/**
	 * @description
	 * Suggests appropriate intents for a participant based on their deliberation history.
	 *
	 * First-time contributors get `RESPOND`/`EXPAND`; experienced contributors get
	 * the full range including `CRITIQUE` and `CHALLENGE`.
	 */
	private suggestIntentsForParticipant(
		context: DeliberationContext,
		participantId: ParticipantId,
	): TurnIntent[] {
		const { turns } = context;
		const lastParticipantTurn = [...turns]
			.reverse()
			.find(
				(t) =>
					t.isFromParticipant &&
					t.isSettled &&
					t.participantId === participantId,
			);

		if (!lastParticipantTurn) {
			return [
				TurnIntent.from(INTENT_OPTION.RESPOND),
				TurnIntent.from(INTENT_OPTION.EXPAND),
			];
		}

		return [
			TurnIntent.from(INTENT_OPTION.CRITIQUE),
			TurnIntent.from(INTENT_OPTION.CHALLENGE),
			TurnIntent.from(INTENT_OPTION.EXPAND),
			TurnIntent.from(INTENT_OPTION.RESPOND),
		];
	}

	/**
	 * @description
	 * Generates human-readable rationale for why a participant might take a given intent.
	 */
	private generateRationale(
		context: DeliberationContext,
		participantId: ParticipantId,
		intent: TurnIntent,
	): string {
		const participant = context.participants.find((p) =>
			p.id.isEqual(participantId),
		);

		const name = participant?.get("displayName") || "AI";
		switch (intent.get("value")) {
			case INTENT_OPTION.RESPOND:
				return `${name} could continue the deliberation naturally`;
			case INTENT_OPTION.CRITIQUE:
				return `${name} might offer critical perspective on recent reasoning`;
			case INTENT_OPTION.EXPAND:
				return `${name} could add depth or nuance to the discussion`;
			case INTENT_OPTION.CHALLENGE:
				return `${name} may question assumptions or conclusions`;
			case INTENT_OPTION.SUMMARIZE:
				return `${name} could synthesize where the deliberation stands`;
			default:
				return `${name} could contribute`;
		}
	}

	/**
	 * @description
	 * Calculates confidence score (0.0–1.0) for a proposal.
	 *
	 * Factors:
	 * - Usage penalty: participants who have spoken many times get lower confidence
	 * - Variety bonus: intents not recently used get higher confidence
	 */
	private calculateConfidence(
		context: DeliberationContext,
		participantId: ParticipantId,
		intent: TurnIntent,
	): number {
		const { turns } = context;
		const participantTurns = turns.filter((t) =>
			t.participantId ? participantId.isEqual(t.participantId) : false,
		);

		const usagePenalty = Math.min(participantTurns.length * 0.1, 0.3);

		const recentIntents = turns
			.slice(-3)
			.filter((t) => t.isFromParticipant)
			.map((t) => t.get("intent"));

		const varietyBonus = recentIntents.includes(intent.get("value")) ? 0 : 0.2;

		return Math.max(0, 0.7 - usagePenalty + varietyBonus);
	}
}
