import type { Room } from "../room";

import type { Turn } from "./turn";
import type { TurnId } from "./turn.id";

export interface TurnRepository {
	findById(id: TurnId): Promise<Turn | null>;
	findByRoom(room: Room): Promise<Turn[]>;
	persist(turn: Turn): Promise<void>;
}
