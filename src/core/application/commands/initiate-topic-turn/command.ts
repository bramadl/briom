/**
 * Input for `InitiateTopicTurnCommand`.
 *
 * The moderator's first message becomes both:
 * 1. The topic (generated via LLM, concise)
 * 2. The first moderator turn content (full text)
 */
export interface InitiateTopicTurnInput {
	/**
	 * @description
	 * Correlation id for FE optimistic reconciliation.
	 */
	clientTurnId?: string;
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
 * Output from `InitiateTopicTurnCommand`.
 */
export interface InitiateTopicTurnOutput {
	/**
	 * @description
	 * Room to contribute to.
	 */
	roomId: string;
	/**
	 * @description
	 * Generated topic derived from the content.
	 */
	topic: string;
	/**
	 * @description
	 * ID of the created turn.
	 */
	turnId: string;
}

/**
 * `InitiateTopicTurnCommand` — Command
 *
 * Intent: Atomically transition a room from FORMING to DELIBERATING
 * by generating a topic from the moderator's first message,
 * creating the opening moderator turn, and auto-triggering
 * the first participant with DIRECT intent.
 *
 * This is the ONLY way to start deliberation. No separate
 * `startDeliberation` call from FE.
 */
export class InitiateTopicTurnCommand {
	public constructor(public readonly input: InitiateTopicTurnInput) {}
}
