import type { RoomOverviewDTO } from "@briom/app/contracts";

/**
 * @description
 * Input for `GetRoomsOverviewQuery`.
 */
export interface GetRoomsOverviewInput {
	/**
	 * @description
	 * Filter rooms by moderator. Only rooms owned by this user are returned.
	 */
	moderatorId: string;
}

/**
 * @description
 * Output from `GetRoomsOverviewQuery`.
 */
export interface GetRoomsOverviewOutput {
	/**
	 * @description
	 * All room overviews for this moderator, ordered newest-first.
	 */
	rooms: RoomOverviewDTO[];
}

/**
 * @description
 * `GetRoomsOverviewQuery` — Query Contract
 *
 * Retrieves a lightweight summary of rooms owned by the given moderator.
 * Returns only display-relevant fields — no turns, no synthesis content.
 *
 * @see DrizzleGetRoomsOverviewQuery — infrastructure implementation
 * @see GetRoomsOverviewHandler — application handler
 */
export interface GetRoomsOverviewQuery {
	execute(input: GetRoomsOverviewInput): Promise<GetRoomsOverviewOutput>;
}
