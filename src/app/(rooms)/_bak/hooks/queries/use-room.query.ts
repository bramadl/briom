"use client";

import { roomQueries } from "@briom/rooms/_/room/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useRoomQuery(roomId: string) {
	return useSuspenseQuery(roomQueries.getRoom({ roomId }));
}
