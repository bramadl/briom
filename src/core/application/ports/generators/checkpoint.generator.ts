import type { RoomId } from "@briom/core/domain";

/**
 * @description
 * Port to the async checkpoint-generation pipeline for a Room.
 *
 * Fully decoupled from turn execution — `enqueue` fires a job that,
 * once resolved, calls `Room.attachCheckpoint()` in its own transaction.
 * The command handler that triggers this never waits on it; FE never
 * calls this directly, it's an implicit orchestration.
 */
export interface ICheckpointGenerator {
	/**
	 * @description
	 * Executes LLM streaming outside of main thread.
	 */
	enqueue(roomId: RoomId): Promise<void>;
}
