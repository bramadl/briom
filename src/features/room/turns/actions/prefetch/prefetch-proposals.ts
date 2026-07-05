"use server";

import type { QueryClient } from "@tanstack/react-query";

import { turnQueryOptions } from "../../queries/query.options";

export async function prefetchProposals(
	queryClient: QueryClient,
	roomId: string,
) {
	await queryClient.prefetchQuery(turnQueryOptions.getProposals(roomId));
}
