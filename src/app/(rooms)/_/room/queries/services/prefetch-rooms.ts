import { isServerError } from "@briom/libs/server-action";
import type { QueryClient } from "@tanstack/react-query";

import { getRooms } from "../../actions";
import { roomQueries } from "../registry";

export async function prefetchRooms(queryClient: QueryClient) {
	const result = await getRooms({});
	if (isServerError(result)) throw new Error(result.error.message);

	void queryClient.prefetchQuery(roomQueries.getRooms({}));

	const { rooms } = result.data;
	return { rooms };
}
