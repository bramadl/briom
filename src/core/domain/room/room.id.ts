import { Id, type UID } from "@briom/libs/drimion";

export type RoomId = UID;
export const RoomId = (value?: string): RoomId => Id(value);
