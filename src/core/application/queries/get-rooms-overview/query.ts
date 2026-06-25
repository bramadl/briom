import type { RoomOverviewDTO } from "@briom/app/contracts";

/**
 * @description
 * Input for `GetRoomsOverviewQuery`.
 *
 * Reserved for future filtering (by status, moderator, search term).
 * MVP: empty — returns all rooms.
 */
export interface GetRoomsOverviewInput {
	criteria?: never;
}

/**
 * @description
 * Output from `GetRoomsOverviewQuery`.
 */
export interface GetRoomsOverviewOutput {
	/**
	 * @description
	 * All room overviews, ordered newest-first.
	 */
	rooms: RoomOverviewDTO[];
}

/**
 * @description
 * `GetRoomsOverviewQuery` — Query Contract
 *
 * Retrieves a lightweight summary of all rooms for sidebar/list views.
 * Returns only display-relevant fields — no turns, no synthesis content,
 * no moderator metadata.
 *
 * **Performance**
 * Single JOIN query (rooms + participants). No turn data loaded.
 * Substantially cheaper than the existing `GetRoomsQuery` which loads
 * participant + turn IDs per room via N+1 queries.
 *
 * @see DrizzleGetRoomsOverviewQuery — infrastructure implementation
 * @see GetRoomsOverviewHandler — application handler
 */
export interface GetRoomsOverviewQuery {
	execute(input: GetRoomsOverviewInput): Promise<GetRoomsOverviewOutput>;
}
