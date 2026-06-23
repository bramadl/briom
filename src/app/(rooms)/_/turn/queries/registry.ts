import type { GetTurnsInput } from "@briom/app";
import { isServerError } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getTurns } from "../actions";

import { turnQueryKeys } from "./keys";

export const turnQueries = {
	getTurns(input: GetTurnsInput) {
		return queryOptions({
			queryKey: turnQueryKeys.turns(input.roomId),
			queryFn: async () => {
				const result = await getTurns(input);
				if (isServerError(result)) throw result.error;
				return result.data;
			},
		});
	},
};
