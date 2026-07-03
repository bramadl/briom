import { unwrapOrThrow } from "@briom/libs/server-action";
import { abortTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAbortTurnMutation() {
	return useMutation({
		mutationFn: unwrapOrThrow(abortTurn),
		onError: (error) => {
			toast.error("Failed to abort turn", { description: error.message });
		},
	});
}
