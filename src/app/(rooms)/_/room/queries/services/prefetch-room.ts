import { prefetchTurns } from "@briom/rooms/_/turn/queries/services/prefetch-turns";
import type { QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { roomQueries } from "../registry";

export async function prefetchRoom(queryClient: QueryClient, roomId: string) {
	await Promise.all([
		queryClient.prefetchQuery(roomQueries.getRoom({ roomId })),
		prefetchTurns(queryClient, roomId),
	]);

	const cachedData = queryClient.getQueryData(
		roomQueries.getRoom({ roomId }).queryKey,
	);

	if (cachedData && !cachedData.room) notFound();
}
