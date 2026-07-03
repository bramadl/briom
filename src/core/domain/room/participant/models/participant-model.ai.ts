import type { Brand } from "@drimion";

/**
 * @description
 * Branded AI model identifier. e.g. "gpt-4o-mini", "claude-3.5-haiku"
 */
export type ParticipantModelAi = Brand<string, "ParticipantModelAi">;
export const ParticipantModelAi = (value: string): ParticipantModelAi =>
	value as ParticipantModelAi;
