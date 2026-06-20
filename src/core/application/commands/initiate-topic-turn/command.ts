/**
 * Input for `InitiateTopicTurnCommand`.
 *
 * The moderator's first message becomes both:
 * 1. The topic (generated via LLM, concise)
 * 2. The first moderator turn content (full text)
 */
export interface InitiateTopicTurnInput {
	content: string;
	moderatorId: string;
	roomId: string;
}

/**
 * Output from `InitiateTopicTurnCommand`.
 */
export interface InitiateTopicTurnOutput {
	roomId: string;
	topic: string;
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
