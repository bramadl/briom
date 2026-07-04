"use server";

import { briom } from "@briom";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function getRooms() {
	const user = await getUser();
	const result = await briom.rooms.all({ moderatorId: user.id });
	return respond(result);
}
