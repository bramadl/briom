/**
 * @description
 * LLM message roles.
 *
 * Maps Briom's deliberation concepts to provider-agnostic
 * role identifiers:
 *
 * - `USER`: moderator turns (human direction)
 * - `ASSISTANT`: participant turns (AI reasoning)
 * - `SYSTEM`: context and instruction framing
 */
export const Role = {
	/**
	 * @description
	 * Maps Briom's moderator turns (human direction).
	 */
	USER: "user",

	/**
	 * @description
	 * Maps Briom's participant turns (AI reasoning).
	 */
	ASSISTANT: "assistant",

	/**
	 * @description
	 * Maps context and instruction framing.
	 */
	SYSTEM: "system",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
