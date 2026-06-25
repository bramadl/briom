import type { RoomStatusOption } from "@briom/domain";

/**
 * @description
 * `RoomOverviewDTO` — Lightweight room summary for list views.
 *
 * Designed for the sidebar room list. Contains only what is needed to
 * render a room card — no turns, no synthesis, no moderator metadata.
 *
 * **Why separate from `RoomDTO`?**
 * `RoomDTO` was built to serve the deliberation page and carries fields
 * irrelevant to a list view (turnIds, synthesisCreatedBy, etc.).
 * `RoomOverviewDTO` is intentionally narrow: one query, one purpose.
 *
 * **`shortId`**
 * A display-safe 8-character prefix of the room UUID, computed at the
 * query layer so FE never has to slice strings.
 *
 * **`participants`**
 * Embedded inline — no join required on the FE side. Only display
 * fields are included; internal IDs are omitted.
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
	participants: Array<{
		/**
		 * @description
		 * Unique participant identifier. Required for keying, proposals, and
		 * participant-specific actions (e.g. synthesis selection).
		 */
		id: string;

		/**
		 * @description
		 * Moderator-assigned display name (e.g. "Claude", "GPT-4").
		 */
		name: string;

		/**
		 * @description
		 * Fully qualified model string in `{provider}/{model}` format.
		 * Example: `"anthropic/claude-3.5-sonnet"`.
		 */
		model: string;
	}>;

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
	status: RoomStatusOption;

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
