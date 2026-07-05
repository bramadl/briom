"use server";

import { briom } from "@briom";
import type { InitiateTurnInput } from "@briom/core/app";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function initiateTurn(
	input: Omit<InitiateTurnInput, "moderatorId">,
) {
	const user = await getUser();
	const result = await briom.turns.initiate({ ...input, moderatorId: user.id });
	return respond(result);
}
