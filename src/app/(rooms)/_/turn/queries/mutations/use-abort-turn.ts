"use client";

import { abortTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * @description
 * `useAbortTurnMutation` — React Query mutation
 *
 * Fires the `abortTurn` server action to interrupt a streaming turn.
 * The turn transitions to FAILED (aborted) on the server; the SSE
 * `turn:failed` event updates local React Query cache automatically via
 * the existing `turnFailedHandler` in event-handlers.ts.
 *
 * No optimistic update needed: the SSE handler already patches the turn
 * to `failed` + clears token buffer when the server broadcasts `turn:failed`.
 */
export function useAbortTurnMutation() {
	return useMutation({
		mutationFn: abortTurn,
		onError: (error) => {
			toast.error("Failed to abort turn", { description: error.message });
		},
	});
}
