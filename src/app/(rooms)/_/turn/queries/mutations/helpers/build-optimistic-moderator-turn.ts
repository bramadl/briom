import type { TurnDTO } from "@briom/app";

interface BuildOptimisticModeratorTurnInput {
	clientTurnId?: string;
	content: string;
	moderatorId: string;
	roomId: string;
	sequence: number;
}

export function buildOptimisticModeratorTurn({
	clientTurnId,
	content,
	moderatorId,
	roomId,
	sequence,
}: BuildOptimisticModeratorTurnInput): TurnDTO {
	const now = new Date().toISOString();
	return {
		author: { type: "moderator", moderatorId },
		createdAt: now,
		error: null,
		failedAt: null,
		id: `optimistic-${clientTurnId}`,
		intent: null,
		perspective: { content, renderedAt: now },
		previousTurnId: null,
		roomId,
		sequence,
		settledAt: now,
		status: "settled",
		tokens: [],
	};
}
