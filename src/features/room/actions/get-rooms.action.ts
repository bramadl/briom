"use server";

import { briom } from "@briom";
import type { GetRoomsInput } from "@briom/core/app";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function getRooms(input: Omit<GetRoomsInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.rooms.all({ ...input, moderatorId: user.id });
	return respond(result);
}
