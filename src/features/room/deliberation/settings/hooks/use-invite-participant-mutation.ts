import { unwrap } from "@briom/libs/server-action";
import { inviteParticipant } from "@briom/room/actions/invite-participant.action";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useInviteParticipantMutation(roomId: string) {
	const queryClient = useQueryClient();
	const targetRoomKey = roomQueryOptions.getRoom(roomId).queryKey;

	return useMutation({
		mutationFn: async (input: Parameters<typeof inviteParticipant>[number]) => {
			return unwrap(await inviteParticipant(input));
		},

		onError: (error) => {
			toast.error("Failed to invite participant", {
				description: error.message,
			});
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: targetRoomKey, exact: true });
		},
	});
}
