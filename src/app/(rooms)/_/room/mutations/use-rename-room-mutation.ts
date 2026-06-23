import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { renameRoom } from "../actions";
import { roomQueryKeys } from "../queries/keys";
import { roomQueries } from "../queries/registry";

export function useRenameRoomMutation() {
	const queryClient = useQueryClient();
	const roomsKey = roomQueries.getRooms({}).queryKey;

	return useMutation({
		mutationFn: renameRoom,

		onMutate: async ({ roomId, newTitle }) => {
			await queryClient.cancelQueries({ queryKey: roomQueryKeys.all });

			const roomKey = roomQueries.getRoom({ roomId }).queryKey;
			const previousRoom = queryClient.getQueryData(roomKey);
			const previousRooms = queryClient.getQueryData(roomsKey);

			if (previousRooms) {
				queryClient.setQueryData(roomsKey, (old) => ({
					...old,
					rooms:
						old?.rooms?.map((r) =>
							r.id === roomId ? { ...r, title: newTitle } : r,
						) ?? [],
				}));
			}

			if (previousRoom) {
				queryClient.setQueryData(roomKey, (old) => {
					if (old?.room) {
						return {
							...old,
							room: { ...old.room, title: newTitle },
						};
					}

					return old;
				});
			}

			return { previousRooms, previousRoom, roomId, roomKey };
		},

		onError: (error, _, context) => {
			if (context) {
				queryClient.setQueryData(roomsKey, context.previousRooms);
				queryClient.setQueryData(context.roomKey, context.previousRoom);
			}
			toast.error("Rename failed", { description: error.message });
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
		},
	});
}
