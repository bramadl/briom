import { DomainError } from "@briom/libs/drimion";

import type { TurnStatusOption } from "../options/turn-status.option";

/**
 * @description
 * Thrown when attempting an invalid status transition in the `Turn` state machine.
 *
 * Examples: settling from `PENDING`, failing from `SETTLED`, abandoning non-failed.
 */
export class InvalidStateTransitionError extends DomainError {
	public constructor(
		from: TurnStatusOption,
		to: TurnStatusOption,
		reason?: string,
	) {
		super(
			`Cannot transition from "${from}" to "${to}"${reason ? `: ${reason}` : ""}`,
			{ context: "Turn" },
		);
	}
}
