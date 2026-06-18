export const Role = {
	USER: "user",
	ASSISTANT: "assistant",
	SYSTEM: "system",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
