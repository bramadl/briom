import { isServerError } from "@briom/rooms/api/lib/server-action";
import type { RoomQueryFnData } from "@briom/rooms/api/queries";
import { queryKeys } from "@briom/rooms/api/queries/keys";
import { renameRoom } from "@briom/rooms/api/room.actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	useRoomInvalidation,
	useRoomsInvalidation,
} from "../queries/invalidations";

export function useRenameRoomMutation(roomId: string) {
	const queryClient = useQueryClient();

	const { invalidate: invalidateRoom } = useRoomInvalidation();
	const { invalidate: invalidateRooms } = useRoomsInvalidation();

	return useMutation({
		mutationFn: renameRoom,
		onMutate: async (newData) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.rooms.get(roomId),
			});

			const previousRoomResult = queryClient.getQueryData<
				RoomQueryFnData["GetRoom"]
			>(queryKeys.rooms.get(roomId));

			queryClient.setQueryData<RoomQueryFnData["GetRoom"]>(
				queryKeys.rooms.get(roomId),
				(old) => {
					if (!old || isServerError(old) || !old.data.room) return old;
					return {
						...old,
						data: {
							...old.data,
							room: { ...old.data.room, title: newData.newTitle },
						},
					};
				},
			);

			return { previousRoomResult };
		},
		onSuccess: (result) => {
			if (isServerError(result)) {
				toast.error("Rename failed", { description: result.error.message });
				return;
			}

			invalidateRoom(roomId);
			invalidateRooms();
		},
		onError: (error, _variables, context) => {
			if (context?.previousRoomResult) {
				queryClient.setQueryData(
					queryKeys.rooms.get(roomId),
					context.previousRoomResult,
				);
			}
			toast.error("Rename failed", { description: error.message });
		},
	});
}
