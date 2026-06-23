import { queryKeys } from "@briom/rooms/_bak/api/queries/keys";
import { useQueryClient } from "@tanstack/react-query";

export function useRoomsInvalidation() {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.rooms.list() });
	};

	return {
		invalidate,
	};
}
