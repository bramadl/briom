import { DomainError } from "@briom/libs/drimion";

import type { IntentOption } from "../options";

/**
 * @description
 * Thrown when a participant's requested intent is inappropriate for the
 * current deliberation state.
 *
 * Examples: summarizing with < 2 settled turns, critiquing without previous
 * participant turns, or intent from a participant not in the room.
 */
export class InvalidIntentForContextError extends DomainError {
	public constructor(intent: IntentOption, reason: string) {
		super(`Intent "${intent}" invalid: ${reason}`, { context: "Turn" });
	}
}
