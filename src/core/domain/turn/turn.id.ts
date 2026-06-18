import { Id, type UID } from "@briom/libs/drimion";

/**
 * @description
 * Unique identifier for a `Turn` aggregate.
 *
 * Branded UID to prevent mixing with `RoomId`, Part`icipantId, or `ModeratorId`.
 */
export type TurnId = UID;
export const TurnId = (value?: string): TurnId => Id(value);
