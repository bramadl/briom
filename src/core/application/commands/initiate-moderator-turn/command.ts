/**
 * @description
 * Input for `InitiateModeratorTurnCommand`.
 */
export interface InitiateModeratorTurnInput {
	/**
	 * @description
	 * Moderator's message content (the human contribution).
	 */
	content: string;
	/**
	 * @description
	 * Moderator ID (must match room's moderator).
	 */
	moderatorId: string;
	/**
	 * @description
	 * Room to contribute to.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `InitiateModeratorTurnCommand`.
 */
export interface InitiateModeratorTurnOutput {
	/**
	 * @description ID of the created turn. */
	turnId: string;
}

/**
 * @description
 * `InitiateModeratorTurnCommand` — Command
 *
 * Intent: Add a human moderator contribution to the deliberation.
 *
 * Moderator turns are synchronous (no LLM streaming) and immediately settled.
 * They represent human direction, questions, or synthesis requests that guide
 * the AI participants' next contributions.
 *
 * @see InitiateModeratorTurnHandler — for execution logic
 * @see Turn.initiateModeratorTurn — for domain factory
 */
export class InitiateModeratorTurnCommand {
	public constructor(public readonly input: InitiateModeratorTurnInput) {}
}
