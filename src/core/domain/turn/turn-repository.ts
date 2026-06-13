import type { RoomId } from "@briom/domain/room";

import type { Turn } from "./turn";

export interface TurnRepository {
	findByRoom(roomId: RoomId): Promise<Turn[]>;
	save(turn: Turn): Promise<void>;
}
