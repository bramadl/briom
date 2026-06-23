import type { QueryClient } from "@tanstack/react-query";

import { ROOM_EVENT_HANDLERS } from "../sse-maps";
import type { SseEventName } from "../sse-types";

export function roomSseHandler(
	eventName: SseEventName,
	data: unknown,
	queryClient: QueryClient,
	roomId: string,
): void {
	const handler = ROOM_EVENT_HANDLERS[eventName];
	if (!handler) {
		console.warn(`[SSE] Unhandled event: ${eventName}`);
		return;
	}
	handler.handle({ data, queryClient, roomId });
}
