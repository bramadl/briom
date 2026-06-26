import type { RoomDeliberationTurnDTO } from "@briom/app";

interface BuildOptimisticModeratorTurnInput {
	clientTurnId?: string;
	content: string;
}

export function buildOptimisticModeratorTurn({
	clientTurnId,
	content,
}: BuildOptimisticModeratorTurnInput): RoomDeliberationTurnDTO {
	return {
		author: { type: "moderator", profile: null },
		content,
		error: null,
		id: `optimistic-${clientTurnId}`,
		intent: null,
		status: "settled",
		createdAt: new Date().toISOString(),
		failedAt: null,
		settledAt: null,
	};
}
