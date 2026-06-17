import type { RoomId } from "../room";

import type { TurnStatusOption } from "./options";
import type { Turn } from "./turn";
import type { TurnId } from "./turn.id";

export interface TurnRepository {
	findById(id: TurnId): Promise<Turn | null>;
	findByRoom(roomId: RoomId): Promise<Turn[]>;
	findByRoomAndStatus(
		roomId: RoomId,
		status: TurnStatusOption,
	): Promise<Turn[]>;
	save(turn: Turn): Promise<void>;
}
