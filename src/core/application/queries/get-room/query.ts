import type { RoomStatusOption } from "@briom/core/domain";

/**
 * @description
 * `RoomDTO` — Data Transfer Object.
 *
 * Flat, serializable representation of a `Room` aggregate for read operations.
 * Contains all data needed to render a room in the UI without loading
 * the full aggregate graph.
 *
 * **Why a DTO?**
 * The `Room` aggregate contains entities (Participants) and value objects that
 * are not directly serializable. The DTO collapses these into primitive types
 * suitable for JSON, caching, and API responses.
 *
 * **Identity Preservation**
 * IDs remain as strings (not objects) for transport, but retain their
 * domain meaning through naming (roomId, participantIds, turnIds).
 */
export interface RoomDTO {
	/**
	 * @description
	 * ISO 8601 timestamp of room creation.
	 */
	createdAt: string;

	/**
	 * @description
	 * Unique room identifier.
	 */
	id: string;

	/**
	 * @description
	 * Moderator (human user) who guides this deliberation.
	 */
	moderatorId: string;

	/**
	 * @description
	 * IDs of invited AI participants. Empty during `FORMING` status.
	 */
	participantIds: string[];

	/**
	 * @description
	 * Current lifecycle status of the room.
	 */
	status: RoomStatusOption;

	/**
	 * @description
	 * Human-readable room title.
	 */
	title: string;

	/**
	 * @description
	 * Deliberation topic (null until deliberation starts).
	 */
	topic: string | null;

	/**
	 * @description
	 * IDs of turns in this room, ordered by sequence.
	 */
	turnIds: string[];
}

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
