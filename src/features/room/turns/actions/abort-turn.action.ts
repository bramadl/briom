"use server";

import { briom } from "@briom";
import type { AbortTurnInput } from "@briom/core/app";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function abortTurn(input: Omit<AbortTurnInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.turns.abort({ ...input, moderatorId: user.id });
	return respond(result);
}
