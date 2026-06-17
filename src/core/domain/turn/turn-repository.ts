import type { RoomId } from "@briom/domain/room";

import type { Turn } from "./turn";
import type { TurnId } from "./turn-id";
import type { TurnStatus } from "./turn-status";

export interface TurnRepository {
	delete(roomId: RoomId, turnId: TurnId): Promise<boolean>;
	findByRoom(roomId: RoomId): Promise<Turn[]>;
	getByRoom(roomId: RoomId, turnId: TurnId): Promise<Turn | null>;
	save(turn: Turn): Promise<void>;
	updateStatus(id: TurnId, status: TurnStatus, content?: string): Promise<void>;
}
