import type { RoomTurnDTO } from "@briom/core/app";

export function buildOptimisticModeratorTurn(params: {
	attachments: RoomTurnDTO["attachments"];
	content: string;
	moderatorTurnId: string;
	sequence: number;
}): RoomTurnDTO {
	const now = new Date().toISOString();
	return {
		id: params.moderatorTurnId,
		author: {
			type: "moderator",
			profile: { moderator: null, participant: null },
		},
		content: params.content,
		attachments: params.attachments,
		createdAt: now,
		settledAt: now,
		failedAt: null,
		error: null,
		intent: null,
		status: "settled",
	};
}
