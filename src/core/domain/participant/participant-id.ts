import type { Brand } from "@briom/shared/brand";

export type ParticipantId = Brand<string, "ParticipantId">;
export const ParticipantId = (value: string): ParticipantId =>
	value as ParticipantId;
