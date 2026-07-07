import { resolveMediaType } from "@briom/core/domain";
import { unwrap } from "@briom/libs/server-action";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { useTurnCollapseStore } from "@briom/room/turns/hooks/use-turn-collapse-store";
import { turnStreamActions } from "@briom/room/turns/store/turn-stream.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { initiateTurn } from "../actions/initiate-turn.action";
import { buildOptimisticModeratorTurn } from "../optimistics/build-moderator-turn.optimistic";
import { buildOptimisticParticipantTurn } from "../optimistics/build-participant-turn.optimistic";

export function useInitiateTurnMutation(roomId: string) {
	const queryClient = useQueryClient();
	const queryKey = roomQueryOptions.getRoom(roomId).queryKey;

	const toggleExpanded = useTurnCollapseStore((s) => s.toggleExpanded);

	const collapseAllExpanded = useTurnCollapseStore(
		(s) => s.collapseAllExpanded,
	);

	return useMutation({
		mutationFn: async (input: Parameters<typeof initiateTurn>[number]) => {
			return unwrap(await initiateTurn(input));
		},

		onMutate: async (input) => {
			collapseAllExpanded();

			await queryClient.cancelQueries({ queryKey, exact: true });
			const previous = queryClient.getQueryData(queryKey);

			if (!input.moderatorTurnId || !previous?.data.room) return { previous };

			const room = previous.data.room;
			const optimisticTurn = buildOptimisticModeratorTurn({
				attachments: (input.attachments ?? []).map((a) => ({
					mediaType: resolveMediaType(a.mimeType) ?? "text",
					mimeType: a.mimeType,
					name: a.name,
					sizeBytes: a.sizeBytes,
					url: a.url,
				})),
				content: input.content,
				moderatorTurnId: input.moderatorTurnId,
				sequence: room.info.turns.length,
			});

			queryClient.setQueryData(queryKey, {
				...previous,
				data: {
					...previous.data,
					room: {
						...room,
						info: {
							...room.info,
							turns: [...room.info.turns, optimisticTurn],
						},
					},
				},
			});

			return { previous };
		},

		onSuccess: (data) => {
			const current = queryClient.getQueryData(queryKey);
			if (!current?.data.room) return;

			toggleExpanded(data.data.nextResponder.turn.id);
			const room = current.data.room;
			const alreadyPresent = room.info.turns.some(
				(t) => t.id === data.data.nextResponder.turn.id,
			);

			if (alreadyPresent) return;
			const placeholderTurn = buildOptimisticParticipantTurn({
				nextResponder: data.data.nextResponder,
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

			turnStreamActions.claimTurn(data.data.nextResponder.turn.id);
		},

		onError: (_err, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey, exact: true });
		},
	});
}
