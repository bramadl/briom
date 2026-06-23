"use client";

import { supabaseClient } from "@briom/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { roomSseHandler } from "./handlers/sse-handlers";
import { ROOM_EVENT_NAMES } from "./sse-maps";

interface UseRoomSSEOptions {
	roomId: string;
}

export function useRoomSSE({ roomId }: UseRoomSSEOptions) {
	const queryClient = useQueryClient();
	useEffect(() => {
		const channel = supabaseClient.channel(`room:${roomId}`);
		for (const eventName of ROOM_EVENT_NAMES) {
			channel.on("broadcast", { event: eventName }, ({ payload }) => {
				roomSseHandler(eventName, payload, queryClient, roomId);
			});
		}

		channel.subscribe((status) => {
			if (status === "SUBSCRIBED") {
				console.log(`[Realtime] Connected: ${roomId}`);
			}

			if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
				console.error(`[Realtime] Connection issue: ${status}`);
			}
		});

		return () => {
			supabaseClient.removeChannel(channel);
		};
	}, [roomId, queryClient]);
}
