import type { Room } from "./room";
import type { RoomId } from "./room-id";

export interface RoomRepository {
	delete(room: Room): Promise<void>;
	findById(id: RoomId): Promise<Room | null>;
	save(room: Room): Promise<void>;
}
