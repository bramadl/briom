export const TURN_STATUS_OPTION = {
	PENDING: "pending",
	STREAMING: "streaming",
	SETTLED: "settled",
	FAILED: "failed",
	ABANDONED: "abandoned",
} as const;

export type TurnStatusOption =
	(typeof TURN_STATUS_OPTION)[keyof typeof TURN_STATUS_OPTION];
