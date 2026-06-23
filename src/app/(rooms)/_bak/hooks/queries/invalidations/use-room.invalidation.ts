import { queryKeys } from "@briom/rooms/_bak/api/queries/keys";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useRoomInvalidation() {
	const queryClient = useQueryClient();
	const invalidate = useCallback(
		(roomId: string) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.rooms.get(roomId) });
		},
		[queryClient],
	);

	return {
		invalidate,
	};
}
