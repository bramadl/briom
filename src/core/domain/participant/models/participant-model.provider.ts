import type { Brand } from "@briom/core/shared";

export type ParticipantModelProvider = Brand<
	string,
	"ParticipantModelProvider"
>;

export const ParticipantModelProvider = (
	value: string,
): ParticipantModelProvider => value as ParticipantModelProvider;
