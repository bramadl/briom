import type { RoomDTO } from "@briom/app/bak/contracts";

/**
 * @description
 * Input for `GetRoomsQuery`.
 *
 * Currently empty — MVP lists all rooms without filtering. Future versions
 * may add pagination, status filters, or moderator-scoped queries.
 */
export interface GetRoomsInput {
	/**
	 * @description
	 * Explicitly empty — no criteria yet.
	 */
	criteria?: never;
}

/**
 * @description
 * Output from `GetRoomsQuery`.
 */
export interface GetRoomsOutput {
	/**
	 * @description
	 * All rooms with their relations, ordered by creation time descending.
	 */
	rooms: RoomDTO[];
}

/**
 * @description
 * `GetRoomsQuery` — Query Contract
 *
 * Retrieves all rooms in the system with their relations.
 * Read-only, no side effects.
 *
 * **MVP Scope**
 * Returns all rooms unfiltered. The frontend handles client-side sorting/filtering.
 * Authentication and authorization are boundary-layer concerns.
 *
 * **Performance Note**
 * Loads all rooms with their participants and turns. For future deployments,
 * adding pagination or projection is considered to this contract.
 *
 * @see GetRoomsHandler — for Result wrapping
 * @see DrizzleGetRoomsQuery — infrastructure implementation
 */
export interface GetRoomsQuery {
	/**
	 * @description
	 * Executes the query.
	 *
	 * @param input - Empty criteria (reserved for future filtering)
	 * @returns All rooms with relations
	 */
	execute(input: GetRoomsInput): Promise<GetRoomsOutput>;
}
