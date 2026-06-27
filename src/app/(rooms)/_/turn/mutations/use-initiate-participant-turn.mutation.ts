import { roomQueries } from "@briom/rooms/_/room/queries/registry";
import { initiateParticipantTurn } from "@briom/rooms/_/turn/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { isOptimisticParticipantTurn } from "./helpers/build-optimistic-participant-turn";

export function useInitiateParticipantTurnMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: initiateParticipantTurn,

		onSuccess: (_, variables) => {
			const deliberationKey = roomQueries.getRoomDeliberation({
				roomId: variables.roomId,
			}).queryKey;

			queryClient.setQueryData(deliberationKey, (old) => {
				if (!old?.room) return old;
				return {
					room: {
						...old.room,
						turns: old.room.turns.filter(
							(t) => !isOptimisticParticipantTurn(t.id),
						),
					},
				};
			});
		},

		onError: (error) => {
			console.error("Failed to render perspective", error);
		},
	});
}
