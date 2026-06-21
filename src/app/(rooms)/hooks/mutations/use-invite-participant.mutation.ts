"use client";

import { isServerError } from "@briom/rooms/api/lib/server-action";
import { inviteParticipant } from "@briom/rooms/api/room.actions";
import { useRoomInvalidation } from "@briom/rooms/hooks/queries/invalidations";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useRoomsInvalidation } from "../queries/invalidations";

export function useInviteParticipantMutation() {
	const { invalidate: invalidateRooms } = useRoomsInvalidation();
	const { invalidate: invalidateRoom } = useRoomInvalidation();

	return useMutation({
		mutationFn: inviteParticipant,
		onSuccess: (result, variables) => {
			if (isServerError(result)) {
				toast.error(`${variables.displayName} couldn't join`, {
					description: "You can retry from the room panel.",
				});
				return;
			}

			invalidateRooms();
			invalidateRoom(variables.roomId);
			toast.success(`${variables.displayName} joined`, {
				description: "Ready to participate.",
			});
		},
		onError: (_error, variables) => {
			toast.error(`${variables.displayName} couldn't join`, {
				description: "You can retry from the room panel.",
			});
		},
	});
}
