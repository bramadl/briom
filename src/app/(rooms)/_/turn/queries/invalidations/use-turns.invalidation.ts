import { useQueryClient } from "@tanstack/react-query";

import { turnQueryKeys } from "../keys";

export function useTurnsInvalidation() {
	const queryClient = useQueryClient();
	const invalidate = (roomId: string) => {
		queryClient.invalidateQueries({ queryKey: turnQueryKeys.turns(roomId) });
	};

	return { invalidate };
}
