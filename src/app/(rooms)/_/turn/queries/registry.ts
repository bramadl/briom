import type { GetTurnProposalsInput } from "@briom/app/bak";
import { isServerError } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getTurnProposals } from "../actions";

import { turnQueryKeys } from "./keys";

export const turnQueries = {
	getTurnProposals(input: GetTurnProposalsInput) {
		return queryOptions({
			queryKey: turnQueryKeys.proposals(input.roomId),
			queryFn: async () => {
				const result = await getTurnProposals(input);
				if (isServerError(result)) throw result.error;
				return result.data;
			},
		});
	},
};
