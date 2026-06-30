import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export class EmptyMovementReasonError extends DomainError {
	public constructor() {
		super("Movement reason cannot be empty", { context: "CreditMovement" });
	}
}
