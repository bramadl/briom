import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when a moderator's display name is less than 4 characters.
 */
export class InsufficientNameError extends DomainError {
	public constructor() {
		super("Name must be at least 4 characters long", { context: "Moderator" });
	}
}
