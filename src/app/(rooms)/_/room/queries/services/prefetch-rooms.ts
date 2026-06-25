import type { QueryClient } from "@tanstack/react-query";

import { roomQueries } from "../registry";

export async function prefetchRooms(queryClient: QueryClient) {
	await queryClient.prefetchQuery(roomQueries.getRoomsOverview({}));
}
