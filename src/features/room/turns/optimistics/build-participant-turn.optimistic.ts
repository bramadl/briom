import type { InitiateTurnOutput, RoomTurnDTO } from "@briom/core/app";

export function buildOptimisticParticipantTurn(params: {
	nextResponder: InitiateTurnOutput["nextResponder"];
	previousSequence: number;
}): RoomTurnDTO {
	const { nextResponder } = params;
	return {
		id: nextResponder.turn.id,
		author: {
			type: "participant",
			profile: {
				moderator: null,
				participant: {
					id: nextResponder.participant.id,
					name: nextResponder.participant.displayName,
					model: nextResponder.participant.qualifiedModel,
				},
			},
		},
		content: "",
		attachments: [],
		createdAt: new Date().toISOString(),
		settledAt: null,
		failedAt: null,
		error: null,
		intent: nextResponder.turn.intent,
		status: "pending",
	};
}
