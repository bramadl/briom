"use client";

import { isServerError } from "@briom/rooms/api/lib/server-action";
import { retryTurn } from "@briom/rooms/api/turn.actions";
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
