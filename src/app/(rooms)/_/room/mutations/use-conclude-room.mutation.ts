import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { concludeRoom } from "../actions";
import { roomQueryKeys } from "../queries/keys";

export function useConcludeRoomMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: concludeRoom,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
			toast.success("Deliberation concluded", {
				description: "This room is now read-only.",
			});
		},
		onError: (error) => {
			toast.error("Failed to conclude room", { description: error.message });
		},
	});
}
