import type { QueryClient } from "@tanstack/react-query";

import { turnQueries } from "../registry";

export async function prefetchTurnProposals(
	queryClient: QueryClient,
	roomId: string,
) {
	await queryClient.prefetchQuery(turnQueries.getTurnProposals({ roomId }));
}
