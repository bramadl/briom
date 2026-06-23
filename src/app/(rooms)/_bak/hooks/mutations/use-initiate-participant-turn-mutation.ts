"use client";

import { initiateParticipantTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";

export function useInitiateParticipantTurnMutation() {
	return useMutation({
		mutationFn: initiateParticipantTurn,
		onError: (error) => {
			console.error("Failed to render perspective", error);
		},
	});
}
