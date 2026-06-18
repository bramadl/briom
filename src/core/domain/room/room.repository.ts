import type { Room } from "./room";
import type { RoomId } from "./room.id";

export interface RoomRepository {
	close(room: Room): Promise<void>;
	findById(id: RoomId): Promise<Room | null>;
	persist(room: Room): Promise<void>;
}
