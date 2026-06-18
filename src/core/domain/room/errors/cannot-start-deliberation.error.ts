import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when `startDeliberation()` preconditions are not met.
 * Possible reasons: room not in `FORMING` status, no participants invited, or empty topic.
 */
export class CannotStartDeliberationError extends DomainError {
	public constructor(reason: string) {
		super(reason, { context: "Room" });
	}
}
