export const ROOM_STATUS_OPTION = {
	/**
	 * @description
	 * Participants being invited
	 */
	FORMING: "forming",
	/**
	 * @description
	 * Topic set, turns flowing
	 */
	DELIBERATING: "deliberating",
	/**
	 * @description
	 * Moderator paused
	 */
	PAUSED: "paused",
	/**
	 * @description
	 * Summary generated
	 */
	CONCLUDED: "concluded",
} as const;

export type RoomStatusOption =
	(typeof ROOM_STATUS_OPTION)[keyof typeof ROOM_STATUS_OPTION];
