import type { RoomId } from "../room.id";

import type { Checkpoint } from "./checkpoint";
import type { CheckpointId } from "./checkpoint.id";

/**
 * @description
 * Persistence contract for Checkpoint entities.
 *
 * Checkpoints are written once per generation and read mostly
 * for one purpose: finding the latest one for a room before rendering.
 *
 * `findById` exists for audit/debug tracing through
 * `previousCheckpointId`.
 */
export interface ICheckpointRepository {
	/**
	 * @description
	 * Finds a Checkpoint by its unique identifier. Used for audit/debug
	 * tracing through a checkpoint's `previousCheckpointId` chain —
	 * not part of the hot render path.
	 */
	findById(id: CheckpointId): Promise<Checkpoint | null>;

	/**
	 * @description
	 * Returns the most recently generated Checkpoint for a room,
	 * or null if the room has never had one generated.
	 *
	 * This is the only query the renderer needs at render time.
	 */
	findLatestByRoomId(roomId: RoomId): Promise<Checkpoint | null>;

	/**
	 * @description
	 * Persists a newly generated Checkpoint. Checkpoints are write-once —
	 * implementations should insert, never update an existing record.
	 */
	persist(checkpoint: Checkpoint): Promise<void>;
}
