"use client";

import { supabaseClient } from "@briom/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useRoomInvalidation } from "../queries/invalidations/use-room.invalidation";
import { useRoomsInvalidation } from "../queries/invalidations/use-rooms.invalidation";

import { ROOM_EVENT_HANDLERS } from "./event-handlers";
import { ROOM_EVENT_NAMES } from "./event-names";
import {
	destroyTokenBufferManager,
	getTokenBufferManager,
} from "./helpers/token-buffers";

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
			getTokenBufferManager().flush();
			destroyTokenBufferManager();
			supabaseClient.removeChannel(channel);
		};
	}, [queryClient, roomId]);
}
