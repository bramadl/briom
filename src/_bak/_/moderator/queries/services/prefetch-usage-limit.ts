import type { QueryClient } from "@tanstack/react-query";

import { moderatorQueries } from "../registry";

export async function prefetchUsageLimit(queryClient: QueryClient) {
	await queryClient.prefetchQuery(moderatorQueries.getUsageLimit());
}
