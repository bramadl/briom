import { type IResult, Result } from "@briom/libs/drimion";

import type { Participant, ParticipantId } from "../participant";
import {
	INTENT_OPTION,
	InvalidIntentForContextError,
	type Turn,
	TurnIntent,
} from "../turn";

import type { Room } from "./room";

type ParticipantIntent = {
	participantId: ParticipantId;
	intent: TurnIntent;
};

export interface DeliberationContext {
	participants: Participant[];
	room: Room;
	turns: Turn[];
}

export interface TurnProposal {
	confidence: number;
	intent: TurnIntent;
	participantId: ParticipantId;
	rationale: string;
}

export class RoomDeliberation {
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
			.get("participantIds")
			.some((id) => id.isEqual(participantId));

		if (participantNotInRoom) {
			return Result.error(
				new InvalidIntentForContextError(intent, "participant not in room"),
			);
		}

		return Result.success(undefined);
	}

	public proposeNextTurns(context: DeliberationContext): TurnProposal[] {
		const { room, turns, participants } = context;
		if (room.isDeliberating) return [];

		const proposals: TurnProposal[] = [];
		const lastTurn = turns[turns.length - 1];
		const lastParticipantId = lastTurn?.participantId;

		for (const participant of participants) {
			if (lastParticipantId && participant.id.equal(lastParticipantId)) {
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

	private generateRationale(
		context: DeliberationContext,
		participantId: ParticipantId,
		intent: TurnIntent,
	): string {
		const participant = context.participants.find((p) =>
			p.id.equal(participantId),
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

	private calculateConfidence(
		context: DeliberationContext,
		participantId: ParticipantId,
		intent: TurnIntent,
	): number {
		const { turns } = context;
		const participantTurns = turns.filter((t) =>
			t.participantId ? participantId.equal(t.participantId) : false,
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
