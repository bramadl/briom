import { isServerError } from "@briom/libs/server-action";
import type { QueryClient } from "@tanstack/react-query";

import { getTurns } from "../../actions";
import { turnQueries } from "../registry";

export async function prefetchTurns(queryClient: QueryClient, roomId: string) {
	const result = await getTurns({ roomId });
	if (isServerError(result)) throw new Error(result.error.message);

	void queryClient.prefetchQuery(turnQueries.getTurns({ roomId }));

	const { turns } = result.data;
	return { turns };
}
