"use server";

import { briom } from "@briom";
import type { ConcludeRoomInput } from "@briom/core/app";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function concludeRoom(
	input: Omit<ConcludeRoomInput, "moderatorId">,
) {
	const user = await getUser();
	const result = await briom.rooms.conclude({ ...input, moderatorId: user.id });
	return respond(result);
}
