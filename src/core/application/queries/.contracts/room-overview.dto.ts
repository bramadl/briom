import type { RoomStatus } from "@briom/domain";

import type { RoomParticipantDTO } from "./room-participant.dto";

/**
 * @description
 * `RoomOverviewDTO` — Lightweight room summary for list views.
 *
 * Designed for the sidebar room list. Contains only what is needed to
 * render a room card — no turns, no synthesis, no moderator metadata.
 */
export interface RoomOverviewDTO {
	/**
	 * @description
	 * ISO 8601 timestamp of room formation.
	 */
	formedAt: string;

	/**
	 * @description
	 * Full room UUID.
	 */
	id: string;

	/**
	 * @description
	 * Pre-computed participant count. Avoids `participants.length` on FE.
	 */
	participantCount: number;

	/**
	 * @description
	 * Invited AI participants. Ordered by invite sequence.
	 */
	participants: Array<RoomParticipantDTO>;

	/**
	 * @description
	 * First 8 characters of the room UUID for display (e.g. "#a1b2c3d4").
	 * Computed at the query layer.
	 */
	shortId: string;

	/**
	 * @description
	 * Current lifecycle status of the room.
	 */
	status: RoomStatus;

	/**
	 * @description
	 * Human-readable room title.
	 */
	title: string;

	/**
	 * @description
	 * Deliberation topic. Null until deliberation starts.
	 */
	topic: string | null;
}
