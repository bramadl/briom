import { unwrap } from "@briom/libs/server-action";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { turnStreamActions } from "@briom/room/turns/store/turn-stream.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { retryTurn } from "../actions/retry-turn.action";

/**
 * @description
 * Retries a single failed turn. `claimTurn` is called on success rather
 * than waiting for the `initiated` realtime message — closes the small
 * gap between "mutation resolved" and "realtime message round-trips
 * back to this client", so the turn's card flips out of its failed
 * state without a visible beat of nothing happening after the click.
 */
export function useRetryTurnMutation(roomId: string) {
	const queryClient = useQueryClient();
	const queryKey = roomQueryOptions.getRoom(roomId).queryKey;

	return useMutation({
		mutationFn: async (input: Parameters<typeof retryTurn>[number]) => {
			return unwrap(await retryTurn(input));
		},

		onSuccess: (_data, input) => {
			turnStreamActions.claimTurn(input.turnId);
		},

		onError: (error) => {
			toast.error("Failed to retry", { description: error.message });
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey, exact: true });
		},
	});
}
