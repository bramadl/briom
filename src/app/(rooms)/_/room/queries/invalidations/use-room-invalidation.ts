import { useQueryClient } from "@tanstack/react-query";

import { roomQueryKeys } from "../keys";

export function useRoomInvalidation() {
	const queryClient = useQueryClient();
	const invalidate = (roomId: string) => {
		queryClient.invalidateQueries({ queryKey: roomQueryKeys.room(roomId) });
	};

	return { invalidate };
}
