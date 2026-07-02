import type { RoomOverviewDTO } from "../.contracts";

/**
 * @description
 * Input for `GetRoomsQuery`.
 */
export interface GetRoomsInput {
	/**
	 * @description
	 * The ID of the moderator requesting this resource.
	 *
	 * Used for authorization (Auth-Z) checks.
	 * Format: UUID v4. Used
	 */
	moderatorId: string;
}

/**
 * @description
 * Output from `GetRoomsQuery`.
 */
export interface GetRoomsOutput {
	rooms: RoomOverviewDTO[];
}

/**
 * @description
 * `GetRoomsQuery` — Application Query Port
 *
 * Retrieves all rooms in the system with their relations.
 * Read-only, no side effects.
 *
 * @see DrizzleGetRoomsQuery — infrastructure implementation
 * @see GetRoomsHandler — application handler
 */
export interface GetRoomsQuery {
	/**
	 * @description
	 * Executes the query.
	 */
	execute(input: GetRoomsInput): Promise<GetRoomsOutput>;
}
