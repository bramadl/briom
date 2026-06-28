import { unwrapOrThrow } from "@briom/libs/server-action";
import { useMutation } from "@tanstack/react-query";

import { inviteParticipant } from "../actions";

export function useInviteParticipantMutation() {
	return useMutation({ mutationFn: unwrapOrThrow(inviteParticipant) });
}
