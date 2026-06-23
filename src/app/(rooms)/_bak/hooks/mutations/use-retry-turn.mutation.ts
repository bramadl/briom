"use client";

import { isServerError } from "@briom/libs/server-action";
import { retryTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRetryTurnMutation() {
	return useMutation({
		mutationFn: retryTurn,
		onSuccess: (result) => {
			if (isServerError(result)) {
				toast.error("Failed to retry turn", {
					description: result.error.message,
				});
			}
		},
		onError: (error) => {
			toast.error("Failed to retry turn", { description: error.message });
		},
	});
}
