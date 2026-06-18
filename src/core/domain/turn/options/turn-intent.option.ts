export const INTENT_OPTION = {
	RESPOND: "respond",
	CRITIQUE: "critique",
	EXPAND: "expand",
	CHALLENGE: "challenge",
	SUMMARIZE: "summarize",
	DIRECT: "direct",
} as const;

export type IntentOption = (typeof INTENT_OPTION)[keyof typeof INTENT_OPTION];

export const INTENT_INSTRUCTION: Record<IntentOption, string> = {
	[INTENT_OPTION.RESPOND]: "Continue the discussion naturally",
	[INTENT_OPTION.CRITIQUE]: "Offer critical perspective on recent reasoning",
	[INTENT_OPTION.EXPAND]: "Add depth or nuance to the discussion",
	[INTENT_OPTION.CHALLENGE]: "Question assumptions or conclusions",
	[INTENT_OPTION.SUMMARIZE]: "Synthesize where the deliberation stands",
	[INTENT_OPTION.DIRECT]: "Respond directly to the moderator's request",
};
