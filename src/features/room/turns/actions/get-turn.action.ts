"use server";

import { briom } from "@briom";
import type { GetTurnInput } from "@briom/core/app";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function getTurn(input: Omit<GetTurnInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.turns.get({ ...input, moderatorId: user.id });
	return respond(result);
}
