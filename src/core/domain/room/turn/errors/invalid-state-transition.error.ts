import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting an invalid status transition in the `Turn` state machine.
 * Examples: settling from `PENDING`, failing from `SETTLED`, abandoning non-failed.
 */
export class InvalidStateTransitionError extends DomainError {
	public constructor(from: string, to: string, reason: string) {
		super(`Cannot transition from "${from}" to "${to}": ${reason}`, {
			context: "Turn",
		});
	}
}
