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
	 * Lorem ipsum dolor sit amet.
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
	 * Lorem ipsum dolor sit amet.
	 */
	persist(checkpoint: Checkpoint): Promise<void>;
}
