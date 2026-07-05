"use server";

import type { QueryClient } from "@tanstack/react-query";

import { moderatorQueryOptions } from "../../queries/query.options";

export async function prefetchModerator(queryClient: QueryClient) {
	await queryClient.prefetchQuery(moderatorQueryOptions.getProfile());
}
