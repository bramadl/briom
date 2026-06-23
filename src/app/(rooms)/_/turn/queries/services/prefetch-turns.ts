import type { QueryClient } from "@tanstack/react-query";

import { turnQueries } from "../registry";

export async function prefetchTurns(queryClient: QueryClient, roomId: string) {
	await queryClient.prefetchQuery(turnQueries.getTurns({ roomId }));
}
