import type { RoomDTO } from "@briom/app/bak/contracts";

/**
 * @description
 * Input for `GetRoomQuery`.
 */
export interface GetRoomInput {
	/**
	 * @description
	 * The room ID to retrieve.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `GetRoomQuery`.
 */
export interface GetRoomOutput {
	/**
	 * @description
	 * The requested room, or null if not found.
	 */
	room: RoomDTO | null;
}

/**
 * @description
 * `GetRoomQuery` — Query Contract
 *
 * Retrieves a single room by ID with all its relations (participants, turns).
 * Read-only operation — no side effects, no state changes.
 *
 * **CQRS Note**
 * This is a Query, not a Command. It returns data without mutating state.
 * The handler wraps the result in a Result for consistency with the command
 * pattern, but the query itself never fails with domain errors (only "not found").
 *
 * @see GetRoomHandler — for Result wrapping and error handling
 * @see DrizzleGetRoomQuery — infrastructure implementation
 */
export interface GetRoomQuery {
	/**
	 * @description
	 * Executes the query.
	 *
	 * @param input - Room ID to look up
	 * @returns Room data with all relations
	 */
	execute(input: GetRoomInput): Promise<GetRoomOutput>;
}
