import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when a participant's display name is empty.
 * Every participant must have a non-empty human-readable identifier.
 */
export class EmptyDisplayNameError extends DomainError {
	public constructor() {
		super("Display name cannot be empty", { context: "Participant" });
	}
}
