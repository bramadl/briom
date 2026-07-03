import type { QueryClient } from "@tanstack/react-query";

import { participantQueries } from "../registry";

export async function prefetchModels(queryClient: QueryClient) {
	await queryClient.prefetchQuery(participantQueries.getModels({}));
}
