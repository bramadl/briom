"use server";

import { briom } from "@briom";
import type { AcceptProposalInput } from "@briom/core/app";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function acceptProposal(
	input: Omit<AcceptProposalInput, "moderatorId">,
) {
	const user = await getUser();
	const result = await briom.turns.acceptProposal({
		...input,
		moderatorId: user.id,
	});

	return respond(result);
}
