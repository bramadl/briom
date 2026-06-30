import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when a moderator's email is invalid.
 */
export class InvalidEmailError extends DomainError {
	public constructor() {
		super("Email address is not valid", { context: "Moderator" });
	}
}
