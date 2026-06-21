import type { GetTurnsInput } from "@briom/app";
import { queryOptions } from "@tanstack/react-query";

import { getTurns } from "../turn.actions";

import { type QueryKeys, queryKeys } from "./keys";

export interface TurnQueryFnData {
	GetTurns: Awaited<ReturnType<typeof getTurns>>;
}

export const turnQueries = {
	getTurns(input: GetTurnsInput) {
		return queryOptions<
			TurnQueryFnData["GetTurns"],
			Error,
			TurnQueryFnData["GetTurns"],
			QueryKeys["Turns"]["List"]
		>({
			queryFn: async () => getTurns(input),
			queryKey: queryKeys.turns.list(input.roomId),
		});
	},
};
