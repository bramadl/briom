import { briom } from "@briom";
import type {
	GetTurnsInput,
	GetTurnsOutput,
	InitiateTopicTurnInput,
	InitiateTopicTurnOutput,
} from "@briom/app";
import { revalidatePath } from "next/cache";

import type { ServerActionResult } from "./lib/server-action";
import { parseError } from "./lib/server-error.utils";
import { parseResponse } from "./lib/server-response.utils";

// ───── Initiate Topic Turn ────────────────────────
export async function initiateTopicTurn(
	input: InitiateTopicTurnInput,
): Promise<ServerActionResult<InitiateTopicTurnOutput>> {
	const result = await briom.turns.initiateTopicTurn(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	revalidatePath(`/rooms/${input.roomId}`, "page");
	return parseResponse(result.value());
}

// ───── Get Turns ────────────────────────────────────────────────
export async function getTurns(
	input: GetTurnsInput,
): Promise<ServerActionResult<GetTurnsOutput>> {
	const result = await briom.turns.list(input);

	if (result.isError()) {
		return parseError(result.error());
	}

	return parseResponse(result.value());
}
