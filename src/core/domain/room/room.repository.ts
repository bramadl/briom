import type { ModeratorId } from "../moderator";

import type { Room } from "./room";
import type { RoomId } from "./room.id";

export interface RoomRepository {
	close(room: Room): Promise<void>;
	findById(id: RoomId): Promise<Room | null>;
	findByModerator(moderatorId: ModeratorId): Promise<Room[]>;
	persist(room: Room): Promise<void>;
}
