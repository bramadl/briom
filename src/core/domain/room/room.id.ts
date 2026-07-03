import { Id, type UID } from "@drimion";

/**
 * @description
 * Unique identifier for a `Room` aggregate.
 */
export type RoomId = UID;
export const RoomId = (value?: string): RoomId => Id(value);
