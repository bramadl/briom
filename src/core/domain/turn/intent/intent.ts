export const INTENT = {
	CHALLENGE: "challenge",
	CRITIQUE: "critique",
	DIRECT: "direct",
	EXPAND: "expand",
	RESPOND: "respond",
	SUMMARIZE: "summarize",
} as const;

export type Intent = (typeof INTENT)[keyof typeof INTENT];
export const Intent = (value: string): Intent => value.toLowerCase() as Intent;
