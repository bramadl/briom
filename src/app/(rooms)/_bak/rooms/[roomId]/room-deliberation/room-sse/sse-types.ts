import type { QueryClient } from "@tanstack/react-query";

export type SseEventName =
	| "room:deliberation-concluded"
	| "room:deliberation-paused"
	| "room:deliberation-resumed"
	| "room:deliberation-started"
	| "room:formed"
	| "room:participant-joined"
	| "room:turn-registered"
	| "turn:failed"
	| "turn:initiated"
	| "turn:settled"
	| "turn:started"
	| "turn:token";

export type SseEventHandler<TPayload = unknown> = {
	handle: (ctx: {
		data: TPayload;
		queryClient: QueryClient;
		roomId: string;
	}) => void;
};
