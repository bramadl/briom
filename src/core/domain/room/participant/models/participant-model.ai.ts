import type { Brand } from "@briom/core/shared";

/**
 * @description
 * Branded type for AI model identifiers.
 *
 * Prevents accidental use of raw strings where a validated model ID is expected.
 * Examples: "gpt-4", "claude-3.5-sonnet", "gemini-pro".
 */
export type ParticipantModelAi = Brand<string, "ParticipantModelAi">;
export const ParticipantModelAi = (value: string): ParticipantModelAi =>
	value as ParticipantModelAi;
