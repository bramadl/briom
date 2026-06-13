export const AI_PROVIDER = {
	OPENAI: "openai",
	ANTHROPIC: "anthropic",
	GOOGLE: "google",
} as const;

export type AiProvider = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];
