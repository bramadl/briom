import type {
	RoomDeliberationParticipantDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app/bak";

export const OPTIMISTIC_PARTICIPANT_PREFIX = "optimistic-participant-" as const;

interface BuildOptimisticParticipantTurnInput {
	participant: RoomDeliberationParticipantDTO;
}

export function buildOptimisticParticipantTurn({
	participant,
}: BuildOptimisticParticipantTurnInput): RoomDeliberationTurnDTO {
	return {
		id: `${OPTIMISTIC_PARTICIPANT_PREFIX}${participant.id}`,
		author: {
			type: "participant",
			profile: {
				id: participant.id,
				displayName: participant.name,
				model: participant.model,
			},
		},
		intent: null,
		content: "",
		status: "pending",
		error: null,
		createdAt: new Date().toISOString(),
		failedAt: null,
		settledAt: null,
	};
}

export function isOptimisticParticipantTurn(turnId: string): boolean {
	return turnId.startsWith(OPTIMISTIC_PARTICIPANT_PREFIX);
}
