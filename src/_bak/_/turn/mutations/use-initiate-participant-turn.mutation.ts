import type {
	InitiateParticipantTurnInput,
	InitiateParticipantTurnOutput,
} from "@briom/app/bak";
import { type ServerResponse, unwrapOrThrow } from "@briom/libs/server-action";
import { initiateParticipantTurn } from "@briom/rooms/_/turn/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useInitiateParticipantTurnMutation() {
	return useMutation<
		ServerResponse<InitiateParticipantTurnOutput>,
		Error,
		Omit<InitiateParticipantTurnInput, "moderatorId">
	>({
		mutationFn: unwrapOrThrow<
			Omit<InitiateParticipantTurnInput, "moderatorId">,
			InitiateParticipantTurnOutput
		>(initiateParticipantTurn),

		onError: (error) => {
			const message = error?.message ?? "Failed to render perspective";

			if (message.includes("Monthly turn limit reached")) {
				toast.error("Monthly limit reached", {
					description:
						"You've used all 200 AI turns this month. Resets on the 1st.",
				});
				return;
			}

			console.error("Failed to render perspective", error);
		},
	});
}
