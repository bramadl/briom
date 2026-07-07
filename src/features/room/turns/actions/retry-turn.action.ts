"use server";

import { briom } from "@briom";
import type { RetryTurnInput } from "@briom/core/app";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function retryTurn(input: Omit<RetryTurnInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.turns.retry({ ...input, moderatorId: user.id });
	return respond(result);
}
