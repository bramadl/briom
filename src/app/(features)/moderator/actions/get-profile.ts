"use server";

import { briom } from "@briom";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function getProfile() {
	const user = await getUser();
	const result = await briom.moderators.profile({ moderatorId: user.id });
	return respond(result);
}
