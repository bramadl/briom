import type { Room } from "../room";
import type { RoomId } from "../room.id";

import type { Turn } from "./turn";
import type { TurnId } from "./turn.id";

/**
 * @description
 * `TurnRepository` — Repository Contract
 *
 * Abstracts persistence of `Turn` aggregates. Implementations handle the actual
 * database operations while the domain remains storage-agnostic.
 *
 * **DDD Note**: `Turns` are aggregate roots with their own repository because
 * they have independent lifecycle events (stream, settle, fail, retry) that
 * don't require loading the entire Room aggregate.
 */
export interface ITurnRepository {
	/**
	 * @description
	 * Finds a turn by its unique identifier, fully reconstituted.
	 */
	findById(id: TurnId): Promise<Turn | null>;

	/**
	 * @description
	 * Finds all turns within a room, ordered by sequence.
	 */
	findByRoomId(roomId: RoomId): Promise<Turn[]>;

	/**
	 * @description
	 * Get the latest turn from the given room.
	 */
	getLatestTurnFrom(room: Room): Promise<Turn | null>;

	/**
	 * @description
	 * Persists a turn and its state changes. Handles insert or update.
	 */
	persist(turn: Turn): Promise<void>;
}
