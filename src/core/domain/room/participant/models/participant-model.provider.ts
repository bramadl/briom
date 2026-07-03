import type { Brand } from "@drimion";

/**
 * @description
 * Branded provider identifier. e.g. "openai", "anthropic", "google"
 */
export type ParticipantModelProvider = Brand<
	string,
	"ParticipantModelProvider"
>;

export const ParticipantModelProvider = (
	value: string,
): ParticipantModelProvider => value as ParticipantModelProvider;
