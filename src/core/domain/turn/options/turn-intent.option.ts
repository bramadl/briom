export const INTENT_OPTION = {
	RESPOND: "respond",
	CRITIQUE: "critique",
	EXPAND: "expand",
	CHALLENGE: "challenge",
	SUMMARIZE: "summarize",
	DIRECT: "direct",
} as const;

export type IntentOption = (typeof INTENT_OPTION)[keyof typeof INTENT_OPTION];
