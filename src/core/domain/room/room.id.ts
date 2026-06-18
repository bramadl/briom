import { Id, type UID } from "@briom/libs/drimion";

/**
 * @description
 * Unique identifier for a `Room` aggregate.
 *
 * Typed as a branded UID to prevent accidental mixing with other domain IDs
 * (e.g., `TurnId`, `ParticipantId`) at compile time.
 */
export type RoomId = UID;
export const RoomId = (value?: string): RoomId => Id(value);
