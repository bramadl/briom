import { turnQueries } from "@briom/rooms/_/turn/queries/registry";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTurnProposalsInvalidation } from "../queries/invalidations/use-turn-proposals.invalidation";

export function useTurnProposals(roomId: string) {
	const { invalidate } = useTurnProposalsInvalidation();

	const {
		data: { proposals },
	} = useSuspenseQuery(turnQueries.getTurnProposals({ roomId }));

	return {
		invalidate,
		proposals,
	};
}
