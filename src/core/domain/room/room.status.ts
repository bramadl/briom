/**
 * @description
 * Room status lifecycle: FORMING → DELIBERATING → CONCLUDED.
 * State transitions are guarded by domain invariants in the Room aggregate.
 */
export const RoomStatus = {
	/**
	 * @description
	 * Participants are being invited. Deliberation has not begun.
	 */
	FORMING: "forming",

	/**
	 * @description
	 * Topic is set, turns are flowing. Active deliberation in progress.
	 */
	DELIBERATING: "deliberating",

	/**
	 * @description
	 * Deliberation has ended. Room is read-only.
	 */
	CONCLUDED: "concluded",
} as const;

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];
