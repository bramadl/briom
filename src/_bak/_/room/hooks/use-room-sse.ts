"use client";

import { supabaseClient } from "@briom/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTurnStreamStore } from "../../deliberation/hooks/use-turn-stream.store";
import { useRoomInvalidation } from "../queries/invalidations/use-room.invalidation";
import { useRoomsInvalidation } from "../queries/invalidations/use-rooms.invalidation";
import { ROOM_EVENT_HANDLERS } from "../sse/event-handlers";
import { ROOM_EVENT_NAMES } from "../sse/event-names";

interface UseRoomSSEOptions {
	onTurnInitiated?: () => void;
	roomId: string;
}

export function useRoomSSE({ onTurnInitiated, roomId }: UseRoomSSEOptions) {
	const queryClient = useQueryClient();
	const { invalidate: invalidateRooms } = useRoomsInvalidation();
	const { invalidate: invalidateRoom } = useRoomInvalidation();

	const onTurnInitiatedRef = useRef(onTurnInitiated);
	onTurnInitiatedRef.current = onTurnInitiated;

	const invalidateRoomsRef = useRef(invalidateRooms);
	invalidateRoomsRef.current = invalidateRooms;

	const invalidateRoomRef = useRef(invalidateRoom);
	invalidateRoomRef.current = invalidateRoom;

	useEffect(() => {
		let channel = supabaseClient.channel(`room:${roomId}`);
		let retryTimeout: ReturnType<typeof setTimeout> | null = null;
		let destroyed = false;

		function subscribe() {
			for (const eventName of ROOM_EVENT_NAMES) {
				channel.on("broadcast", { event: eventName }, ({ payload }) => {
					const handler = ROOM_EVENT_HANDLERS[eventName];
					if (!handler) {
						console.warn(`[SSE] Unhandled event: ${eventName}`);
						return;
					}

					handler({ data: payload, queryClient, roomId });
					switch (eventName) {
						case "turn:initiated":
							onTurnInitiatedRef.current?.();
							break;
						case "turn:settled":
							invalidateRoomsRef.current();
							invalidateRoomRef.current(roomId);
							break;
					}
				});
			}

			channel.subscribe((status) => {
				if (status === "SUBSCRIBED") {
					console.log(`[SSE] Connected: ${roomId}`);
				}

				if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
					console.warn(`[SSE] ${status}, reconnecting...`);
					if (destroyed) return;

					supabaseClient.removeChannel(channel);

					retryTimeout = setTimeout(() => {
						if (destroyed) return;
						channel = supabaseClient.channel(`room:${roomId}`);
						subscribe();
					}, 3000);
				}
			});
		}

		subscribe();

		return () => {
			destroyed = true;
			if (retryTimeout) clearTimeout(retryTimeout);
			useTurnStreamStore.getState().clearRoom(roomId);
			supabaseClient.removeChannel(channel);
		};
	}, [queryClient, roomId]);
}
