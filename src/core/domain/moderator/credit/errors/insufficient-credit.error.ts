import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when a moderator performs failure deduction.
 */
export class InsufficientCreditError extends DomainError {
	public constructor() {
		super("Not enough Briom Credits to complete this action", {
			context: "Moderator",
		});
	}
}
