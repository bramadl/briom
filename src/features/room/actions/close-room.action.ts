"use server";

import { briom } from "@briom";
import type { CloseRoomInput } from "@briom/core/app";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function closeRoom(input: Omit<CloseRoomInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.rooms.close({ ...input, moderatorId: user.id });
	return respond(result);
}
