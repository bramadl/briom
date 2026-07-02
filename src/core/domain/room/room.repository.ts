import type { Moderator } from "../moderator";

import type { Room } from "./room";
import type { RoomId } from "./room.id";

/**
 * @description
 * Repository contract for the `Room` aggregate.
 *
 * Abstracts persistence details from the domain. Implementations
 * handle the actual database operations while the domain remains
 * ignorant of storage technology.
 */
export interface IRoomRepository {
	/**
	 * @description
	 * Removes a room and all its associated data from persistence.
	 */
	close(room: Room): Promise<void>;

	/**
	 * @description
	 * Count room for the given moderator.
	 */
	countFor(moderator: Moderator): Promise<number>;

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
