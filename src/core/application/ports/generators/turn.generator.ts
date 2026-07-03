import type { RoomId, TurnId } from "@briom/core/domain";

/**
 * @description
 * Port to the async execution pipeline for a participant Turn.
 *
 * `enqueue` only registers the job — it resolves once the job is
 * accepted by the queue, not once the LLM stream actually completes.
 * The command handler that calls this never awaits the LLM call itself.
 */
export interface ITurnGenerator {
	/**
	 * @description
	 * Executes LLM streaming outside of main thread.
	 */
	enqueue(roomId: RoomId, turnId: TurnId): Promise<void>;
}
