import type { GetTurnsInput } from "@briom/app";
import { queryOptions } from "@tanstack/react-query";

import { getTurns } from "../turn.actions";
import { queryKeys } from "./keys";

export const turnQueries = {
	getTurns(input: GetTurnsInput) {
		return queryOptions<
			Awaited<ReturnType<typeof getTurns>>,
			Error,
			Awaited<ReturnType<typeof getTurns>>,
			ReturnType<typeof queryKeys.turns.list>
		>({
			queryFn: async () => getTurns(input),
			queryKey: queryKeys.turns.list(),
		});
	},
};
