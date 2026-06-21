"use client";

import { roomQueries } from "@briom/rooms/api/queries/room.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useRoomsQuery() {
	return useSuspenseQuery(roomQueries.getRooms({}));
}
