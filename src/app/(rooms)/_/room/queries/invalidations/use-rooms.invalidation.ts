import { useQueryClient } from "@tanstack/react-query";

import { roomQueryKeys } from "../keys";

export function useRoomsInvalidation() {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: roomQueryKeys.rooms() });
	};

	return { invalidate };
}
