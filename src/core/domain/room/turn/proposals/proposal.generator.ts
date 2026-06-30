import type { ParticipantId } from "../../participant";
import { TurnIntent } from "../turn.intent";

import type { ProposalContext } from "./proposal.context";
import type { ProposalResult } from "./proposal.result";
import { selectMood, selectProposalLabel } from "./proposal-dictionary";

// biome-ignore lint/complexity/noStaticOnlyClass: <DomainService>
export class ProposalGenerator {
	/**
	 * @description
	 * Generates turn proposals for eligible participants.
	 *
	 * Suggests who could speak next and with what intent, ranked by confidence.
	 * Excludes the most recent speaker to encourage perspective diversity.
	 *
	 * Returns an empty array when the room is not actively deliberating.
	 */
	public static proposeNextTurns(
		context: ProposalContext,
		random: () => number = Math.random,
	): ProposalResult[] {
		const { room, turns, participants } = context;
		if (!room.isDeliberating) return [];

		const lastSpeakerId = turns.findLast(
			(t) => t.isFromParticipant,
		)?.participantId;

		const participantPool = participants.filter(
			(p) => !lastSpeakerId || !p.id.isEqual(lastSpeakerId),
		);

		const settledCount = turns.filter((t) => t.isSettled).length;
		const hasHistory = turns.some((t) => t.isFromParticipant && t.isSettled);

		const intentPool: TurnIntent[] = [
			TurnIntent.RESPOND,
			TurnIntent.EXPAND,
			...(hasHistory ? [TurnIntent.CRITIQUE, TurnIntent.CHALLENGE] : []),
			...(settledCount >= 2 ? [TurnIntent.SUMMARIZE] : []),
		];

		return participantPool.map((participant) => {
			const intent = intentPool[Math.floor(random() * intentPool.length)];

			const mood = selectMood({
				turnCount: turns.length,
				hasFailedTurn: turns.some((t) => t.isFailed),
				lastIntent: turns.at(-1)?.get("intent") ?? undefined,
				participantCount: participants.length,
			});

			return {
				participantId: participant.id,
				intent,
				rationale: ProposalGenerator.generateRationale(
					context,
					participant.id,
					intent,
					mood,
				),
				confidence: parseFloat((0.5 + random() * 0.5).toFixed(2)),
			};
		});
	}

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	private static generateRationale(
		context: ProposalContext,
		participantId: ParticipantId,
		intent: TurnIntent,
		mood: ReturnType<typeof selectMood>,
	): string {
		const participant = context.participants.find((p) =>
			p.id.isEqual(participantId),
		);

		const name = participant?.displayName ?? "AI";
		return selectProposalLabel(intent, name, mood);
	}
}
