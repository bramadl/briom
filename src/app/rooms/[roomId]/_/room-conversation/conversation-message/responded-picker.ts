import type { ParticipantDTO, TurnDTO } from "@briom/core/application";

export function pickAutoResponder(
	participants: ParticipantDTO[],
	turns: TurnDTO[],
): ParticipantDTO | undefined {
	const lastParticipantTurn = [...turns]
		.reverse()
		.find((t) => t.role === "participant");

	const candidates = participants.filter(
		(p) => p.id !== lastParticipantTurn?.participantId,
	);

	if (candidates.length === 0) return undefined;
	return candidates[Math.floor(Math.random() * candidates.length)];
}
