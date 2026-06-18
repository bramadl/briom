/**
 * @description
 * LLM message roles.
 *
 * Maps Briom's deliberation concepts to provider-agnostic role identifiers:
 * - `USER`: moderator turns (human direction)
 * - `ASSISTANT`: participant turns (AI reasoning)
 * - `SYSTEM`: context and instruction framing
 */
export const Role = {
	USER: "user",
	ASSISTANT: "assistant",
	SYSTEM: "system",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
