import { unwrap } from "@briom/libs/server-action";
import { renameRoom } from "@briom/room/actions/rename-room.action";
import { roomQueryOptions } from "@briom/room/queries/internal/query.options";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRenameRoomMutation(roomId: string) {
	const queryClient = useQueryClient();

	const targetRoomKey = roomQueryOptions.getRoom(roomId).queryKey;
	const allRoomsKey = roomQueryOptions.getRooms().queryKey;

	return useMutation({
		mutationFn: async (input: Parameters<typeof renameRoom>[0]) => {
			return unwrap(await renameRoom(input));
		},

		onMutate: async ({ title }) => {
			await queryClient.cancelQueries({ queryKey: targetRoomKey });

			const previousRoom = queryClient.getQueryData(targetRoomKey);
			queryClient.setQueryData(targetRoomKey, (old) => {
				if (!old?.data.room) return old;
				return {
					...old,
					data: {
						...old.data,
						room: {
							...old.data.room,
							title,
						},
					},
				};
			});

			// Also update the room in the sidebar which uses `getRooms`.
			const previousRoomsList = queryClient.getQueryData(allRoomsKey);
			queryClient.setQueryData(allRoomsKey, (old) => {
				if (!old?.data?.rooms) return old;
				return {
					...old,
					data: {
						...old.data,
						rooms: old.data.rooms.map((r) =>
							r.id === roomId ? { ...r, title } : r,
						),
					},
				};
			});

			return { previousRoom, previousRoomsList };
		},

		onError: (error, _newTitle, context) => {
			toast.error("Failed to rename room", { description: error.message });
			if (context?.previousRoom) {
				queryClient.setQueryData(targetRoomKey, context.previousRoom);
			}
			if (context?.previousRoomsList) {
				queryClient.setQueriesData(
					{ queryKey: allRoomsKey },
					context.previousRoomsList,
				);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: targetRoomKey, exact: true });
			queryClient.invalidateQueries({ queryKey: allRoomsKey, exact: true });
		},
	});
}
