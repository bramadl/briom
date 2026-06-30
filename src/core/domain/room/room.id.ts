import { Id, type UID } from "@briom/libs/drimion";

/**
 * @description
 * Unique identifier for a `Room` aggregate.
 */
export type RoomId = UID;
export const RoomId = (value?: string): RoomId => Id(value);
