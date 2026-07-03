import { unwrapOrThrow } from "@briom/libs/server-action";
import { retryTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";

export function useRetryTurnMutation() {
	return useMutation({
		mutationFn: unwrapOrThrow(retryTurn),
		onError: (error) => {
			console.error("Failed to retry turn", { description: error.message });
		},
	});
}
