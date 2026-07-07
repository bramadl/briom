import { unwrap } from "@briom/libs/server-action";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { abortTurn } from "../actions/abort-turn.action";

export function useAbortTurnMutation() {
	return useMutation({
		mutationFn: async (input: Parameters<typeof abortTurn>[number]) => {
			return unwrap(await abortTurn(input));
		},

		onError: (error) => {
			toast.error("Failed to abort", { description: error.message });
		},
	});
}
