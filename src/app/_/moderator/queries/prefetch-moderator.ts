"use server";

import type { QueryClient } from "@tanstack/react-query";

import { moderatorQueryOptions } from "./internal/query.options";

export async function prefetchModerator(queryClient: QueryClient) {
	await queryClient.prefetchQuery(moderatorQueryOptions.getProfile());
}
