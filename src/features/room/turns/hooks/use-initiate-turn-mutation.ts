import { resolveMediaType } from "@briom/core/domain";
import { unwrap } from "@briom/libs/server-action";
import { useDeliberationStore } from "@briom/room/deliberation/hooks/use-deliberation-store";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { initiateTurn } from "../actions/initiate-turn.action";
import { buildOptimisticModeratorTurn } from "../optimistics/build-moderator-turn.optimistic";
import { buildOptimisticParticipantTurn } from "../optimistics/build-participant-turn.optimistic";

export function useInitiateTurnMutation(roomId: string) {
	const queryClient = useQueryClient();
	const queryKey = roomQueryOptions.getRoom(roomId).queryKey;

	const claimTurn = useDeliberationStore((s) => s.claimTurn);
	const collapseAllExpanded = useDeliberationStore(
		(s) => s.collapseAllExpanded,
	);

	return useMutation({
		mutationFn: async (input: Parameters<typeof initiateTurn>[number]) => {
			return unwrap(await initiateTurn(input));
		},

		/**
		 * @description
		 * Injects the moderator's own turn into the room cache immediately
		 * — this is the "true zero-latency" half of the optimistic update,
		 * since every field it needs is already known client-side (the
		 * content just typed, attachments already uploaded, and an ID this
		 * mutation itself generates). Snapshots the previous cache value
		 * so `onError` can restore it exactly.
		 *
		 * Also fires `collapseAllExpanded()` here rather than in
		 * `onSuccess` — this is the earliest point at which we know a new
		 * turn is being sent, and collapsing previous turns should feel
		 * instantaneous (part of the "send" action itself), not gated
		 * behind a network round trip.
		 */
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

		/**
		 * @description
		 * Appends the participant placeholder using data the command
		 * output already gave us (`nextResponder`), and claims the turn in
		 * the store immediately — ahead of the `TurnInitiated` realtime
		 * broadcast, which would otherwise be the only thing driving this.
		 * The realtime handler still fires when the broadcast eventually
		 * arrives; `claimTurn` is idempotent for the same turnId, so that
		 * second call is a harmless no-op, not a correctness concern.
		 */
		onSuccess: (data) => {
			const current = queryClient.getQueryData(queryKey);
			if (!current?.data.room) return;

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

			claimTurn(data.data.nextResponder.turn.id);
		},

		/**
		 * @description
		 * Restores the exact pre-mutation snapshot from `onMutate`. Does
		 * NOT attempt to restore `expandedTurnIds` — `collapseAllExpanded`
		 * already ran optimistically in `onMutate`, and re-expanding
		 * everything on a failed send would be a jarring layout snap-back
		 * for a state that was arguably reasonable anyway (turns collapsed
		 * is not itself wrong, even if the send that triggered it failed).
		 */
		onError: (_err, _input, context) => {
			console.error(_err);
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}
		},

		/**
		 * @description
		 * Fires on both success and error, converging the cache to
		 * server-truth regardless of outcome:
		 *
		 * - Success: the optimistic moderator turn and participant
		 *   placeholder are already visually present, so this invalidation
		 *   is a correctness pass (real IDs already match — see
		 *   `InitiateTurnHandler.createModeratorTurn`'s `passedId` — so no
		 *   flicker), not what makes them appear.
		 * - Error: cache was already rolled back in `onError`; this just
		 *   guards against drift from anything else that changed
		 *   server-side despite the error (defensive, cheap).
		 */
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey, exact: true });
		},
	});
}
