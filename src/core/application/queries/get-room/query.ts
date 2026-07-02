import type { RoomDTO } from "../.contracts/room.dto";

/**
 * @description
 * Input for `GetRoomQuery`.
 */
export interface GetRoomInput {
	/**
	 * @description
	 * The ID of the moderator requesting this resource.
	 *
	 * Used for authorization (Auth-Z) checks.
	 * Format: UUID v4. Used
	 */
	moderatorId: string;

	/**
	 * @description
	 * Room to get.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `GetRoomQuery`.
 */
export interface GetRoomOutput {
	room: RoomDTO | null;
}

/**
 * @description
 * `GetTurnProposalsQuery` — Application Query Port
 *
 * Returns the complete denormalized view of a room's
 * deliberation in a single round-trip.
 *
 * @see DrizzleGetRoomQuery — infrastructure implementation
 * @see GetRoomHandler — application handler
 */
export interface GetRoomQuery {
	/**
	 * @description
	 * Executes the query.
	 */
	execute(input: GetRoomInput): Promise<GetRoomOutput>;
}
