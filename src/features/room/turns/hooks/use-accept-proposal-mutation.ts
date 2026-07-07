import { unwrap } from "@briom/libs/server-action";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { turnStreamActions } from "@briom/room/turns/store/turn-stream.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptProposal } from "../actions/accept-proposal.action";
import { buildOptimisticParticipantTurn } from "../optimistics/build-participant-turn.optimistic";
import { turnQueryOptions } from "../queries/query.options";
import { useTurnCollapseStore } from "./use-turn-collapse-store";

export function useAcceptProposalMutation(roomId: string) {
	const queryClient = useQueryClient();
	const queryKey = roomQueryOptions.getRoom(roomId).queryKey;
	const collapseAllExcept = useTurnCollapseStore((s) => s.collapseAllExcept);

	return useMutation({
		mutationFn: async (input: Parameters<typeof acceptProposal>[number]) => {
			return unwrap(await acceptProposal(input));
		},

		onMutate: async () => {
			queryClient.cancelQueries({
				queryKey: turnQueryOptions.getProposals(roomId).queryKey,
				exact: true,
			});

			const previousCollapseState = {
				forceCollapsedIds: new Set(
					useTurnCollapseStore.getState().forceCollapsedIds,
				),
				forceExpandedIds: new Set(
					useTurnCollapseStore.getState().forceExpandedIds,
				),
			};

			collapseAllExcept([]);

			await queryClient.cancelQueries({ queryKey, exact: true });
			const previous = queryClient.getQueryData(queryKey);

			return { previous, previousCollapseState };
		},

		onSuccess: (data) => {
			const current = queryClient.getQueryData(queryKey);
			if (!current?.data.room) return;

			const room = current.data.room;
			const alreadyPresent = room.info.turns.some(
				(t) => t.id === data.data.turn.id,
			);

			if (alreadyPresent) return;
			const placeholderTurn = buildOptimisticParticipantTurn({
				nextResponder: {
					participant: data.data.participant,
					turn: data.data.turn,
				},
				previousSequence: room.info.turns.length,
			});

			queryClient.setQueryData(queryKey, {
				...current,
				data: {
					...current.data,
					room: {
						...room,
						info: {
							...room.info,
							turns: [...room.info.turns, placeholderTurn],
						},
					},
				},
			});

			turnStreamActions.claimTurn(data.data.turn.id);
		},

		onError: (_err, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}

			if (context?.previousCollapseState) {
				useTurnCollapseStore.setState(context.previousCollapseState);
			}
		},
	});
}
