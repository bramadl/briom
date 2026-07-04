"use server";

import { prefetchModerator } from "@briom/app/_/moderator";
import type { QueryClient } from "@tanstack/react-query";

import { prefetchParticipantModels } from "../participant/queries/prefetch-participant-models";
import { roomQueryOptions } from "./internal/query.options";

export async function prefetchRooms(queryClient: QueryClient) {
	await Promise.all([
		prefetchModerator(queryClient),
		prefetchParticipantModels(queryClient),
		queryClient.prefetchQuery(roomQueryOptions.getRooms()),
	]);
}
