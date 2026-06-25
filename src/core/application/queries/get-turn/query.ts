import type { TurnDTO } from "@briom/app/contracts";

/**
 * @description
 * Input for `GetTurnQuery`.
 */
export interface GetTurnInput {
	/**
	 * @description
	 * The turn ID to retrieve.
	 */
	turnId: string;
}

/**
 * @description
 * Output from `GetTurnQuery`.
 */
export interface GetTurnOutput {
	/**
	 * @description
	 * The requested turn.
	 */
	turn: TurnDTO | null;
}

/**
 * @description
 * `GetTurnQuery` — Query Contract
 *
 * Retrieves a single turn by ID.
 * Read-only, no side effects.
 *
 * **Use Cases**
 * - Polling a specific turn's status after SSE reconnect
 * - Loading a turn detail view
 * - Verifying turn state before retry/abandon commands
 *
 * @see GetTurnHandler — for Result wrapping
 * @see DrizzleGetTurnQuery — infrastructure implementation
 */
export interface GetTurnQuery {
	/**
	 * @description
	 * Executes the query.
	 *
	 * @param input - Turn ID to look up
	 * @returns Turn data
	 * @throws Error if turn not found
	 */
	execute(input: GetTurnInput): Promise<GetTurnOutput>;
}
