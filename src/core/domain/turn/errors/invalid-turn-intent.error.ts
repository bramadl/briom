import { DomainError } from "@briom/libs/drimion";

import type { IntentOption } from "../options";

export class InvalidTurnIntentError extends DomainError {
	public constructor(intent: IntentOption, reason: string) {
		super(`Intent "${intent}" is invalid: ${reason}`, { context: "Intent" });
	}
}
