"use server";

import { roomQueryOptions } from "@briom/room/queries/query.options";
import { prefetchProposals } from "@briom/room/turns/actions/prefetch/prefetch-proposals";
import type { QueryClient } from "@tanstack/react-query";

export async function prefetchRoom(queryClient: QueryClient, roomId: string) {
	await Promise.all([
		queryClient.prefetchQuery(roomQueryOptions.getRoom(roomId)),
		prefetchProposals(queryClient, roomId),
	]);
}
