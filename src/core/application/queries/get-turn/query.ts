import type { RoomTurnDTO } from "../.contracts/room-turn.dto";

/**
 * @description
 * Input for `IGetTurnQuery`.
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
 * Output from `IGetTurnQuery`.
 */
export interface GetTurnOutput {
	/**
	 * @description
	 * The requested turn.
	 */
	turn: RoomTurnDTO | null;
}

/**
 * @description
 * `IGetTurnQuery` — Query Port
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
export interface IGetTurnQuery {
	/**
	 * @description
	 * Executes the query.
	 */
	execute(input: GetTurnInput): Promise<GetTurnOutput>;
}

/**
 * @description
 * `GetTurnQuery` — Message class routed through `QueryBus`.
 *
 * Mirrors the Command pattern used across the application layer
 * (`.input` wrapper) so every read and write operation has a single,
 * consistent entry point via `CommandBus`/`QueryBus`.
 */
export class GetTurnQuery {
	public constructor(public readonly input: GetTurnInput) {}
}
