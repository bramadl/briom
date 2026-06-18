/**
 * @description
 * Available intent options for participant turns.
 *
 * Each intent shapes the system prompt and guides the LLM's reasoning style.
 * Intents create the contrast, tension, and synthesis that make deliberation
 * valuable — they are the core mechanism for perspective evolution.
 */
export const INTENT_OPTION = {
	/**
	 * @description
	 * Continue the discussion naturally, building on previous perspectives.
	 */
	RESPOND: "respond",
	/**
	 * @description
	 * Offer critical perspective on recent reasoning, identifying weaknesses.
	 */
	CRITIQUE: "critique",
	/**
	 * @description
	 * Add depth, nuance, or alternative angles to the discussion.
	 */
	EXPAND: "expand",
	/**
	 * @description
	 * Question assumptions or conclusions, provoking deeper examination.
	 */
	CHALLENGE: "challenge",
	/**
	 * @description
	 * Synthesize where the deliberation stands, identifying agreements and gaps.
	 */
	SUMMARIZE: "summarize",
	/**
	 * @description
	 * Respond directly to a specific moderator request or instruction.
	 */
	DIRECT: "direct",
} as const;

export type IntentOption = (typeof INTENT_OPTION)[keyof typeof INTENT_OPTION];

/**
 * @description
 * System prompt instructions mapped to each intent.
 *
 * Used by `TranscriptorRenderer` to build context-aware prompts for LLM calls.
 */
export const INTENT_INSTRUCTION: Record<IntentOption, string> = {
	[INTENT_OPTION.RESPOND]: "Continue the discussion naturally",
	[INTENT_OPTION.CRITIQUE]: "Offer critical perspective on recent reasoning",
	[INTENT_OPTION.EXPAND]: "Add depth or nuance to the discussion",
	[INTENT_OPTION.CHALLENGE]: "Question assumptions or conclusions",
	[INTENT_OPTION.SUMMARIZE]: "Synthesize where the deliberation stands",
	[INTENT_OPTION.DIRECT]: "Respond directly to the moderator's request",
};
