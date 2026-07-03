export const ROOM_EVENT_NAMES = [
	"room:deliberation-concluded",
	"room:deliberation-paused",
	"room:deliberation-resumed",
	"room:deliberation-started",
	"room:formed",
	"room:participant-joined",
	"room:turn-registered",
	"turn:failed",
	"turn:initiated",
	"turn:settled",
	"turn:started",
	"turn:token",
] as const;

export type RoomEventName = (typeof ROOM_EVENT_NAMES)[number];
