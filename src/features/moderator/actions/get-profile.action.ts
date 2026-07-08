"use server";

import { briom } from "@briom";
import { getUser } from "@briom/core/infra/auth";
import { respond } from "@briom/libs/server-action";

export async function getProfile() {
	const user = await getUser();
	let result = await briom.moderators.profile({ moderatorId: user.id });

	if (!result.value().moderator) {
		const registerResult = await briom.moderators.register({
			id: user.id,
			email: user.email as string,
			name: user.user_metadata?.name ?? user.email,
			avatar: user.user_metadata?.avatar_url ?? null,
		});

		if (
			registerResult.isError() &&
			registerResult.error().code !== "EMAIL_ALREADY_USED"
		) {
			return respond(registerResult);
		}

		result = await briom.moderators.profile({ moderatorId: user.id });
	}

	return respond(result);
}
