import { useRouter } from "@bprogress/next/app";
import { unwrap } from "@briom/libs/server-action";
import { closeRoom } from "@briom/room/actions/close-room.action";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCloseRoomMutation(roomId: string) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const allRoomsKey = roomQueryOptions.getRooms().queryKey;
	const targetRoomKey = roomQueryOptions.getRoom(roomId).queryKey;

	return useMutation({
		mutationFn: async (input: Parameters<typeof closeRoom>[number]) => {
			return unwrap(await closeRoom(input));
		},

		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: allRoomsKey, exact: true });
			await queryClient.cancelQueries({ queryKey: targetRoomKey });

			const previousRoomsList = queryClient.getQueryData(allRoomsKey);
			queryClient.setQueryData(allRoomsKey, (old) => {
				if (!old?.data?.rooms) return old;
				return {
					...old,
					data: {
						...old.data,
						rooms: old.data.rooms.filter((r) => r.id !== roomId),
					},
				};
			});

			return { previousRoomsList };
		},

		onSuccess: () => {
			queryClient.removeQueries({ queryKey: targetRoomKey, exact: true });
			router.replace("/rooms");
		},

		onError: (error, _input, context) => {
			toast.error("Failed to close the room", { description: error.message });
			if (context?.previousRoomsList) {
				queryClient.setQueryData(allRoomsKey, context.previousRoomsList);
			}
		},

		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: allRoomsKey,
				exact: true,
			});
		},
	});
}
