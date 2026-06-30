import { Id, type UID } from "@briom/libs/drimion";

/**
 * @description
 * Unique identifier for a Participant entity.
 */
export type ParticipantId = UID;
export const ParticipantId = (value?: string): ParticipantId => Id(value);
