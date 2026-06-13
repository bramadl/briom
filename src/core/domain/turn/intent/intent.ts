export const INTENT = {
	RESPOND: "respond",
	CRITIQUE: "critique",
	SUMMARIZE: "summarize",
	CHALLENGE: "challenge",
	EXPAND: "expand",
} as const;

export type Intent = (typeof INTENT)[keyof typeof INTENT];
