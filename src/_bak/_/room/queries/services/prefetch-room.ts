import { prefetchUsageLimit } from "@briom/rooms/_/moderator/queries/services/prefetch-usage-limit";
import { prefetchTurnProposals } from "@briom/rooms/_/turn/queries/services/prefetch-turn-proposals";
import type { QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { roomQueries } from "../registry";

export async function prefetchRoom(queryClient: QueryClient, roomId: string) {
	await Promise.all([
		queryClient.prefetchQuery(roomQueries.getRoomDeliberation({ roomId })),
		prefetchTurnProposals(queryClient, roomId),
		prefetchUsageLimit(queryClient),
	]);

	const cachedData = queryClient.getQueryData(
		roomQueries.getRoomDeliberation({ roomId }).queryKey,
	);

	if (cachedData && !cachedData.room) notFound();
}
