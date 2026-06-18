import { DomainError } from "@briom/libs/drimion";

import type { IntentOption } from "../options";

/**
 * @description
 * Thrown when constructing a `TurnIntent` with an unrecognized intent string.
 */
export class InvalidTurnIntentError extends DomainError {
	public constructor(intent: IntentOption, reason: string) {
		super(`Intent "${intent}" is invalid: ${reason}`, { context: "Intent" });
	}
}
