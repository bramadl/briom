import type { RoomId } from "@briom/domain/room";

export interface TurnSequencer {
	nextPositionFor(roomId: RoomId): Promise<number>;
}
