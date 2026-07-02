import type { RoomId } from "@briom/domain";

/**
 * @description
 * Port to the async topic-summarization pipeline for a Room.
 *
 * Fully decoupled from turn execution — `enqueue` fires a job that,
 * once resolved, calls `Room.setTopic()` in its own transaction. The
 * command handler that triggers this never waits on it; FE never calls
 * this directly, it's implicit orchestration inside `SendModeratorTurn`.
 */
export interface ITopicGenerator {
	/**
	 * @description
	 * Executes LLM streaming outside of main thread.
	 */
	enqueue(roomId: RoomId, seedContent: string): Promise<void>;
}
