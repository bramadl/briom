import type { Brand } from "@briom/core/shared";

/**
 * @description
 * Branded type for model provider identifiers.
 *
 * Prevents accidental use of raw strings where a validated provider is expected.
 * Examples: "openai", "anthropic", "google".
 */
export type ParticipantModelProvider = Brand<
	string,
	"ParticipantModelProvider"
>;

export const ParticipantModelProvider = (
	value: string,
): ParticipantModelProvider => value as ParticipantModelProvider;
