"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { closeRoom } from "../actions";
import { roomQueryKeys } from "../queries/keys";

export function useCloseRoomMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: closeRoom,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
		},
		onError: (error) => {
			toast.error("Failed to close room", { description: error.message });
		},
	});
}
