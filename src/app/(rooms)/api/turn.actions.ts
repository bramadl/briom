import { briom } from "@briom";
import type { GetTurnsInput, GetTurnsOutput } from "@briom/app";

import type { ServerActionResult } from "./lib/server-action";
import { parseError } from "./lib/server-error.utils";
import { parseResponse } from "./lib/server-response.utils";

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
