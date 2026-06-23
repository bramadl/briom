import { retryTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRetryTurnMutation() {
	return useMutation({
		mutationFn: retryTurn,
		onError: (error) => {
			toast.error("Failed to retry turn", { description: error.message });
		},
	});
}
