import { useQueryClient } from "@tanstack/react-query";

import { turnQueryKeys } from "../keys";

export function useTurnProposalsInvalidation() {
	const queryClient = useQueryClient();
	const invalidate = (roomId: string) => {
		queryClient.invalidateQueries({
			queryKey: turnQueryKeys.proposals(roomId),
		});
	};

	return { invalidate };
}
