import { DomainError } from "@briom/libs/drimion";

import type { IntentOption } from "../intent";

export class InvalidIntentForContextError extends DomainError {
	public constructor(intent: IntentOption, reason: string) {
		super(`Intent "${intent}" invalid: ${reason}`, { context: "Turn" });
	}
}
