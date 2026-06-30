import { TurnIntent } from "../turn/turn.intent";

/**
 * @description
 * System prompt instructions per intent.
 *
 * Used by TranscriptorRenderer to build context-aware LLM prompts.
 */
export const INSTRUCTIONS: Record<TurnIntent, string> = {
	[TurnIntent.CHALLENGE]: "Question assumptions or conclusions.",
	[TurnIntent.CRITIQUE]: "Offer critical perspective on recent reasoning.",
	[TurnIntent.DIRECT]: "Respond directly to the moderator's request.",
	[TurnIntent.EXPAND]: "Add depth, nuance, or alternative angles.",
	[TurnIntent.RESPOND]: "Continue the discussion naturally.",
	[TurnIntent.SUMMARIZE]: "Synthesize where the deliberation stands.",
};
