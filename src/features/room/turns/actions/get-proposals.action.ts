"use server";

import { briom } from "@briom";
import type { GetProposalsInput } from "@briom/core/app";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function getProposals(
	input: Omit<GetProposalsInput, "moderatorId">,
) {
	const user = await getUser();
	const result = await briom.turns.proposals({
		...input,
		moderatorId: user.id,
	});

	return respond(result);
}
