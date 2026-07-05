import { unwrap } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getProposals } from "../actions/get-proposals.action";
import { turnQueryKeys } from "./query.keys";

export const turnQueryOptions = {
	getProposals(roomId: string) {
		return queryOptions({
			queryKey: turnQueryKeys.proposals(roomId),
			queryFn: async () => unwrap(await getProposals({ roomId })),
		});
	},
};
