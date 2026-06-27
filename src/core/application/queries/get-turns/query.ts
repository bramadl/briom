import type { TurnDTO } from "@briom/app/contracts";

/**
 * @description
 * Input for `GetTurnsQuery`.
 */
export interface GetTurnsInput {
	/**
	 * @description
	 * Room ID to retrieve turns for.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `GetTurnsQuery`.
 */
export interface GetTurnsOutput {
	/**
	 * @description
	 * All turns in the room, ordered by sequence ascending.
	 */
	turns: TurnDTO[];
}

/**
 * @description
 * `GetTurnsQuery` — Query Contract
 *
 * Retrieves all turns within a room, ordered by sequence.
 * Read-only, no side effects.
 *
 * **Use Cases**
 * - Initial page load: fetch full turn history for a room
 * - Reconnection: sync missed turns after SSE disconnect
 * - Audit: review deliberation progression
 *
 * **Ordering Guarantee**
 * Turns are returned in sequence order (1, 2, 3...). This is critical for
 * reconstructing the deliberation timeline and shared context.
 *
 * @see GetTurnsHandler — for Result wrapping
 * @see DrizzleGetTurnsQuery — infrastructure implementation
 */
export interface GetTurnsQuery {
	/**
	 * @description
	 * Executes the query.
	 *
	 * @param input - Room ID to look up turns for
	 * @returns All turns in sequence order
	 */
	execute(input: GetTurnsInput): Promise<GetTurnsOutput>;
}
