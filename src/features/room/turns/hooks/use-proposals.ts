import type { TurnProposalDTO } from "@briom/core/app";
import {
	turnStreamActions,
	useShouldShowProposals,
} from "@briom/room/turns/store/turn-stream.store";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { turnQueryOptions } from "../queries/query.options";

export function useProposals(roomId: string) {
	const queryClient = useQueryClient();

	const {
		data: {
			data: { proposals },
		},
	} = useSuspenseQuery(turnQueryOptions.getProposals(roomId));

	const shouldShowProposals = useShouldShowProposals();
	const showProposals = shouldShowProposals && proposals.length > 0;

	/**
	 * @todo
	 * Implement accept proposal.
	 */
	const acceptProposal = useCallback(
		(_proposal: TurnProposalDTO) => {
			turnStreamActions.setProposalsVisible(false);
			queryClient.removeQueries({
				queryKey: turnQueryOptions.getProposals(roomId).queryKey,
				exact: true,
			});
		},
		[queryClient, roomId],
	);

	return { acceptProposal, proposals, showProposals };
}
