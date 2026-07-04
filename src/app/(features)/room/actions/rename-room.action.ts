"use server";

import { briom } from "@briom";
import type { RenameRoomInput } from "@briom/core/app";
import { getUser } from "@briom/core/infrastructure/auth";
import { respond } from "@briom/libs/server-action";

export async function renameRoom(input: Omit<RenameRoomInput, "moderatorId">) {
	const user = await getUser();
	const result = await briom.rooms.rename({ ...input, moderatorId: user.id });
	return respond(result);
}
