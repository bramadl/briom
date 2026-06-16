import type { RoomId } from "@briom/domain/room";

import type { Turn } from "./turn";
import type { TurnId } from "./turn-id";
import type { TurnStatus } from "./turn-status";

export interface TurnRepository {
	findByRoom(roomId: RoomId): Promise<Turn[]>;
	save(turn: Turn): Promise<void>;
	updateStatus(id: TurnId, status: TurnStatus, content?: string): Promise<void>;
}
