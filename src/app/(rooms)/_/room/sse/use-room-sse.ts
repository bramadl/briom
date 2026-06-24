import { supabaseClient } from "@briom/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useTurnsInvalidation } from "../../turn/queries/invalidations/use-turns-invalidation";
import { useRoomsInvalidation } from "../queries/invalidations/use-rooms-invalidation";

import { ROOM_EVENT_HANDLERS } from "./event-handlers";
import { ROOM_EVENT_NAMES } from "./event-names";

interface UseRoomSSEOptions {
	onTurnInitiated?: () => void;
	roomId: string;
}

export function useRoomSSE({ onTurnInitiated, roomId }: UseRoomSSEOptions) {
	const queryClient = useQueryClient();
	const { invalidate: invalidateRooms } = useRoomsInvalidation();
	const { invalidate: invalidateTurns } = useTurnsInvalidation();

	useEffect(() => {
		const channel = supabaseClient.channel(`room:${roomId}`);

		for (const eventName of ROOM_EVENT_NAMES) {
			channel.on("broadcast", { event: eventName }, ({ payload }) => {
				const handler = ROOM_EVENT_HANDLERS[eventName];
				if (!handler) {
					console.warn(`[SSE] Unhandled event: ${eventName}`);
					return;
				}

				handler({ data: payload, queryClient, roomId });
				if (eventName === "turn:initiated") onTurnInitiated?.();
				if (eventName === "turn:settled") {
					invalidateRooms();
					invalidateTurns(roomId);
				}
			});
		}

		channel.subscribe((status) => {
			if (status === "SUBSCRIBED") console.log(`[SSE] Connected: ${roomId}`);
			if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
				console.error(`[SSE] Connection issue: ${status}`);
			}
		});

		return () => void supabaseClient.removeChannel(channel);
	}, [invalidateRooms, invalidateTurns, onTurnInitiated, queryClient, roomId]);
}
