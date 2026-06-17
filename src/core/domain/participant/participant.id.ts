import { Id, type UID } from "@briom/libs/drimion";

export type ParticipantId = UID;
export const ParticipantId = (value?: string): ParticipantId => Id(value);
