"use server";

import { briom } from "@briom";
import type { GetRoomInput } from "@briom/core/app";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function getRoom(input: Omit<GetRoomInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.rooms.get({ ...input, moderatorId: user.id });
	return respond(result);
}
