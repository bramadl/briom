import type { TurnProposalDTO } from "@briom/core/app";
import {
	useDeliberationStore,
	useShouldShowProposals,
} from "@briom/room/deliberation/hooks/use-deliberation-store";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { turnQueryKeys } from "../queries/query.keys";
import { turnQueryOptions } from "../queries/query.options";

/**
 * @description
 * Reads proposal data plus render-worthiness in one call.
 *
 * `showProposals` is NOT a local subscription anymore — the previous
 * version of this hook listened for `TurnInitiated`/`TurnSettled`
 * itself, which meant a second, independent realtime consumer outside
 * `useDeliberationRealtime` (the documented single subscription point
 * for the whole room view). This version only reads
 * `useProposalsVisible()`, a store flag that `useDeliberationRealtime`
 * already flips off those exact two events — no new channel, no new
 * listener, one less thing that can drift out of sync with the rest of
 * the deliberation state.
 *
 * `showProposals` here also folds in `proposals.length > 0` — callers
 * previously had to remember to check both `useShouldShowProposals()`
 * AND `proposals.length > 0` separately (see `RoomSequence`'s old
 * `showProposals = useShouldShowProposals() && proposals.length > 0`).
 * Combining them here means `RoomSequence` just renders on the boolean
 * this hook returns.
 */
export function useProposals(roomId: string) {
	const queryClient = useQueryClient();

	const {
		data: {
			data: { proposals },
		},
	} = useSuspenseQuery(turnQueryOptions.getProposals(roomId));

	const shouldShowProposals = useShouldShowProposals();
	const setProposalsVisible = useDeliberationStore(
		(s) => s.setProposalsVisible,
	);

	const showProposals = shouldShowProposals && proposals.length > 0;

	/**
	 * @todo
	 * Implement accept proposal.
	 */
	const acceptProposal = useCallback(
		(_proposal: TurnProposalDTO) => {
			// Optimistically hide immediately on selection — the user has
			// committed to this proposal, so there's no reason to keep
			// showing the rest while whatever follow-up action (e.g.
			// pre-filling the editor, or directly initiating a turn from
			// it) runs. `useDeliberationRealtime`'s `TurnInitiated`/
			// `TurnSettled` handlers remain the authority for turning it
			// back on — this only ever turns it off early.
			setProposalsVisible(false);

			// Best-effort: drop this room's proposals from cache so a
			// stale list isn't served if visibility flips back on before
			// a fresh `TurnSettled` invalidation arrives.
			queryClient.removeQueries({
				queryKey: turnQueryKeys.proposals(roomId),
				exact: true,
			});
		},
		[queryClient, roomId, setProposalsVisible],
	);

	return { acceptProposal, proposals, showProposals };
}
