"use client";

import { turnQueries } from "@briom/rooms/_/turn/queries/registry";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useTurnsQuery(roomId: string) {
	return useSuspenseQuery(turnQueries.getTurns({ roomId }));
}
