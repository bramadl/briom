import { unwrap } from "@briom/libs/server-action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { formRoom } from "../actions/form-room.action";
import { roomQueryKeys } from "../queries/internal/query.keys";

export function useRoomFormMutation() {
	const queryClient = useQueryClient();
	const queryKey = roomQueryKeys.all;

	return useMutation({
		mutationFn: async (input: Parameters<typeof formRoom>[number]) => {
			return unwrap(await formRoom(input));
		},

		onSuccess: ({ data }) => {
			const { warning } = data;
			if (warning) toast.warning("Warning", { description: warning });
			queryClient.invalidateQueries({ queryKey });
		},

		onError: (error) => {
			toast.error("Failed to form room", { description: error.message });
		},
	});
}
