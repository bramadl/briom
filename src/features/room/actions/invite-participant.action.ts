"use server";

import { briom } from "@briom";
import type { InviteParticipantInput } from "@briom/core/app";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function inviteParticipant(
	input: Omit<InviteParticipantInput, "moderatorId">,
) {
	const user = await getUser();
	const result = await briom.rooms.participants.invite({
		...input,
		moderatorId: user.id,
	});

	return respond(result);
}
