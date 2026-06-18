import type { Brand } from "@briom/core/shared";

export type ParticipantModelAi = Brand<string, "ParticipantModelAi">;
export const ParticipantModelAi = (value: string): ParticipantModelAi =>
	value as ParticipantModelAi;
