import type { RoomDeliberationDTO } from "@briom/app/contracts";

/**
 * @description
 * Input for `GetRoomDeliberationQuery`.
 */
export interface GetRoomDeliberationInput {
	/**
	 * @description
	 * The requesting moderator's ID. Used to verify room ownership —
	 * returns null if the room exists but belongs to a different moderator.
	 */
	moderatorId: string;
	/**
	 * @description
	 * The room ID to retrieve the full deliberation view for.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `GetRoomDeliberationQuery`.
 */
export interface GetRoomDeliberationOutput {
	/**
	 * @description
	 * Full deliberation view, or null if the room does not exist or is
	 * not owned by the requesting moderator.
	 */
	room: RoomDeliberationDTO | null;
}

/**
 * @description
 * `GetRoomDeliberationQuery` — Query Contract
 *
 * Returns the complete denormalized view of a room's deliberation in a
 * single round-trip. Replaces the previous two-query pattern
 * (`getRoom` + `getTurns`) that required FE to join participant data
 * onto turns manually.
 *
 * **What's included**
 * - Room metadata (id, title, status, topic, info)
 * - All participants (with display fields only)
 * - All turns ordered by sequence, each with embedded author profile
 * - Synthesis state and content (if completed)
 *
 * **What's NOT included**
 * - Raw `participantId`/`moderatorId` fields inside turn author (only
 *   the display profile is exposed — internal IDs are an infra concern)
 * - `turnIds` array (redundant — turns are already embedded)
 * - Token arrays (always empty; tokens arrive via SSE, not polling)
 *
 * **Performance**
 * Two parallel DB queries (room+participants, turns) joined in application
 * layer via an in-memory Map — O(n) on participant count, typically 1–4.
 * No N+1.
 *
 * @see DrizzleGetRoomDeliberationQuery — infrastructure implementation
 * @see GetRoomDeliberationHandler — application handler
 */
export interface GetRoomDeliberationQuery {
	execute(input: GetRoomDeliberationInput): Promise<GetRoomDeliberationOutput>;
}
