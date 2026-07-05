"use server";

import type { QueryClient } from "@tanstack/react-query";

import { participantQueryOptions } from "../../queries/query.options";

export async function prefetchParticipantModels(queryClient: QueryClient) {
	await queryClient.prefetchQuery(
		participantQueryOptions.getParticipantModels(),
	);
}
