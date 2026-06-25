"use client";

import { abortTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAbortTurnMutation() {
	return useMutation({
		mutationFn: abortTurn,
		onError: (error) => {
			toast.error("Failed to abort turn", { description: error.message });
		},
	});
}
