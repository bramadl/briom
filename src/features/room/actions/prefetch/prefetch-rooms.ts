"use server";

import { prefetchModerator } from "@briom/moderator/actions/prefetch/prefetch-moderator";
import { prefetchParticipantModels } from "@briom/room/participant/actions/prefetch/prefetch-participant-models";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import type { QueryClient } from "@tanstack/react-query";

export async function prefetchRooms(queryClient: QueryClient) {
	await Promise.all([
		prefetchModerator(queryClient),
		prefetchParticipantModels(queryClient),
		queryClient.prefetchQuery(roomQueryOptions.getRooms()),
	]);
}
