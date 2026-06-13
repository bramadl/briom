import type { Brand } from "@briom/shared/brand";

export type RoomId = Brand<string, "RoomId">;
export const RoomId = (value: string): RoomId => value as RoomId;
