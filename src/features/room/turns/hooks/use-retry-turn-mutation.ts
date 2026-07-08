import { unwrap } from "@briom/libs/server-action";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { turnStreamActions } from "@briom/room/turns/store/turn-stream.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { retryTurn } from "../actions/retry-turn.action";

export function useRetryTurnMutation(roomId: string) {
	const queryClient = useQueryClient();
	const queryKey = roomQueryOptions.getRoom(roomId).queryKey;

	return useMutation({
		mutationFn: async (input: Parameters<typeof retryTurn>[number]) => {
			return unwrap(await retryTurn(input));
		},

		onMutate: (input) => {
			turnStreamActions.claimTurn(input.turnId);
		},

		onError: (error, input) => {
			turnStreamActions.failTurn(input.turnId, {
				kind: "retry_failed",
				message: error.message,
			});

			toast.error("Failed to retry", { description: error.message });
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey, exact: true });
		},
	});
}
