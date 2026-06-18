import type { TurnDTO } from "@briom/core/application/_bak";

export interface RetryInfo {
	id?: string;
	intent: string;
	participantId: string;
}

export function findLastFailedTurn(turns: TurnDTO[]): RetryInfo | null {
	for (let i = turns.length - 1; i >= 0; i--) {
		const t = turns[i];
		if (
			t.role === "participant" &&
			t.participantId &&
			t.intent &&
			t.status === "failed"
		) {
			return { id: t.id, participantId: t.participantId, intent: t.intent };
		}
	}
	return null;
}
