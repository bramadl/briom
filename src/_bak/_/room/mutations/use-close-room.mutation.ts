import { unwrapOrThrow } from "@briom/libs/server-action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { closeRoom } from "../actions";
import { roomQueryKeys } from "../queries/keys";

export function useCloseRoomMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: unwrapOrThrow(closeRoom),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
		},
		onError: (error) => {
			toast.error("Failed to close room", { description: error.message });
		},
	});
}
