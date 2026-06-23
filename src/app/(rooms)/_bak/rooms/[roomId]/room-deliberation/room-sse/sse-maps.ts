import { deliberationStartedHandler } from "./handlers/deliberation-started.handler";
import { noopHandler } from "./handlers/noop.handler";
import { participantJoinedHandler } from "./handlers/participant-joined.handler";
import { turnFailedHandler } from "./handlers/turn-failed.handler";
import { turnInitiatedHandler } from "./handlers/turn-initiated.handler";
import { turnRegisteredHandler } from "./handlers/turn-registered.handler";
import { turnSettledHandler } from "./handlers/turn-settled.handler";
import { turnStartedHandler } from "./handlers/turn-started.handler";
import { turnTokenHandler } from "./handlers/turn-token.handler";
import type { SseEventHandler, SseEventName } from "./sse-types";

export const ROOM_EVENT_NAMES: SseEventName[] = [
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
];

// biome-ignore lint/suspicious/noExplicitAny: structural — no variance issues
export const ROOM_EVENT_HANDLERS: Record<SseEventName, SseEventHandler<any>> = {
	"room:deliberation-concluded": noopHandler,
	"room:deliberation-paused": noopHandler,
	"room:deliberation-resumed": noopHandler,
	"room:deliberation-started": deliberationStartedHandler,
	"room:formed": noopHandler,
	"room:participant-joined": participantJoinedHandler,
	"room:turn-registered": turnRegisteredHandler,
	"turn:failed": turnFailedHandler,
	"turn:initiated": turnInitiatedHandler,
	"turn:settled": turnSettledHandler,
	"turn:started": turnStartedHandler,
	"turn:token": turnTokenHandler,
};
