/**
 * @description
 * SUMMARIZE requires enough settled turns to have something worth synthesizing.
 */
export function canSummarize(settledTurnCount: number): boolean {
	return settledTurnCount >= 2;
}

/**
 * @description
 * CRITIQUE and CHALLENGE require a prior participant perspective to engage with.
 */
export function canCritiqueOrChallenge(
	hasPreviousParticipantTurn: boolean,
): boolean {
	return hasPreviousParticipantTurn;
}
