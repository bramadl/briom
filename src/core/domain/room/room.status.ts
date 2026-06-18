/**
 * @description
 * `Room` status lifecycle states.
 *
 * Represents the deliberate progression of a thinking space from formation
 * through active deliberation to conclusion. State transitions are guarded
 * by domain invariants in the `Room` aggregate.
 *
 * @see Room — for transition rules and invariant enforcement
 */
export const ROOM_STATUS_OPTION = {
	/**
	 * @description
	 * Participants are being invited. Deliberation has not begun.
	 * Only state where new participants can be added.
	 */
	FORMING: "forming",
	/**
	 * @description
	 * Topic is set, turns are flowing. Active deliberation in progress.
	 */
	DELIBERATING: "deliberating",
	/**
	 * @description
	 * Moderator has paused deliberation. Turns cannot be initiated.
	 */
	PAUSED: "paused",
	/**
	 * @description
	 * Deliberation has ended. `Room` is read-only.
	 */
	CONCLUDED: "concluded",
} as const;

export type RoomStatusOption =
	(typeof ROOM_STATUS_OPTION)[keyof typeof ROOM_STATUS_OPTION];
