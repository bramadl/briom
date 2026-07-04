"use server";

import { briom } from "@briom";
import type { FormRoomInput } from "@briom/core/app";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function formRoom(input: Omit<FormRoomInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.rooms.form({ ...input, moderatorId: user.id });
	return respond(result);
}
