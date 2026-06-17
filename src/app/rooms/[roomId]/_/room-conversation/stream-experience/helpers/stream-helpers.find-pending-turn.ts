import type { TurnDTO } from "@briom/core/application";

export function findPendingTurn(turns: TurnDTO[]): TurnDTO | undefined {
	return turns.find(
		(t) =>
			t.role === "participant" &&
			t.status === "pending" &&
			t.participantId != null &&
			t.intent != null,
	);
}
