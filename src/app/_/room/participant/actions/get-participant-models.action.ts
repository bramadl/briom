"use server";

import { openRouter } from "@briom/openrouter/client";

export async function getParticipantModels() {
	return openRouter.models.list();
}
