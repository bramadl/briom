"use client";

import { turnQueries } from "@briom/rooms/api/queries/turn.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useTurnsQuery(roomId: string) {
	return useSuspenseQuery(turnQueries.getTurns({ roomId }));
}
