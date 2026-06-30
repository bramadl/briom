/**
 * @description
 * The purpose of a participant turn — why this voice speaks now.
 *
 * Intent shapes the system prompt given to the LLM and defines
 * the nature of the perspective contributed to the deliberation.
 * Without intent, turns are generic responses; with intent, each
 * turn has a deliberate role in evolving shared understanding.
 */
export const TurnIntent = {
	/**
	 * @description
	 * Question assumptions or conclusions.
	 */
	CHALLENGE: "challenge",

	/**
	 * @description
	 * Offer critical perspective on recent reasoning.
	 */
	CRITIQUE: "critique",

	/**
	 * @description
	 * Respond directly to the moderator's request.
	 */
	DIRECT: "direct",

	/**
	 * @description
	 * Add depth, nuance, or alternative angles.
	 */
	EXPAND: "expand",

	/**
	 * @description
	 * Continue the discussion naturally, building on previous perspectives.
	 */
	RESPOND: "respond",

	/**
	 * @description
	 * Synthesize where the deliberation stands.
	 */
	SUMMARIZE: "summarize",
} as const;

export type TurnIntent = (typeof TurnIntent)[keyof typeof TurnIntent];
