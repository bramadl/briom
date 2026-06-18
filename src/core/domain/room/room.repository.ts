import type { Room } from "./room";
import type { RoomId } from "./room.id";

/**
 * @description
 * Repository contract for the `Room` aggregate.
 *
 * Abstracts persistence details from the domain. Implementations (e.g., DrizzleRoomRepository)
 * handle the actual database operations while the domain remains ignorant of storage technology.
 *
 * **DDD Rule**: Only aggregate roots have repositories. `Room` is the consistency boundary;
 * participants and turns are persisted through `Room` or their own repositories respectively.
 */
export interface RoomRepository {
	/**
	 * @description
	 * Removes a room and all its associated data from persistence.
	 */
	close(room: Room): Promise<void>;

	/**
	 * @description
	 * Finds a room by its unique identifier, including reconstituting
	 * all aggregate state (participants, turn IDs).
	 */
	findById(id: RoomId): Promise<Room | null>;

	/**
	 * @description
	 * Persists a room and its state changes. Handles both insert (new room)
	 * and update (existing room with mutations).
	 */
	persist(room: Room): Promise<void>;
}
