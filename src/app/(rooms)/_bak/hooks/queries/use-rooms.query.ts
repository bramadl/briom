"use client";

import { roomQueries } from "@briom/rooms/_/room/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useRoomsQuery() {
	return useSuspenseQuery(roomQueries.getRooms({}));
}
