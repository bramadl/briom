/**
 * @file use-room-sse.ts
 * @path src/app/(rooms)/_/room/sse/use-room-sse.ts
 *
 * Subscribes to room broadcast events via Supabase Realtime.
 *
 * ## Changes from previous version
 *
 * - `token-buffers` import removed: RAF batching is no longer needed because
 *   `turn:token` now writes to a Zustand store (synchronous, no React re-render).
 * - On unmount, `clearRoom()` is called to purge stream store entries for this
 *   room, preventing memory leaks across navigation.
 */

"use client";

import { supabaseClient } from "@briom/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useRoomInvalidation } from "../queries/invalidations/use-room.invalidation";
import { useRoomsInvalidation } from "../queries/invalidations/use-rooms.invalidation";
import { ROOM_EVENT_HANDLERS } from "../sse/event-handlers";
import { ROOM_EVENT_NAMES } from "../sse/event-names";
import { useTurnStreamStore } from "../sse/store/turn-stream.store";

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
		const channel = supabaseClient.channel(`room:${roomId}`);

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
						// Invalidate sidebar/overview after a turn settles
						invalidateRoomsRef.current();
						invalidateRoomRef.current(roomId);
						break;
				}
			});
		}

		channel.subscribe((status) => {
			if (status === "SUBSCRIBED") console.log(`[SSE] Connected: ${roomId}`);
			if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
				console.error(`[SSE] Connection issue: ${status}`);
			}
		});

		return () => {
			// Clean up stream store entries for this room
			useTurnStreamStore.getState().clearRoom(roomId);
			supabaseClient.removeChannel(channel);
		};
	}, [queryClient, roomId]);
}
