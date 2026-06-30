import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when `startDeliberation()` preconditions are not met.
 */
export class CannotStartDeliberationError extends DomainError {
	public constructor(reason: string) {
		super(reason, { context: "Room" });
	}
}
