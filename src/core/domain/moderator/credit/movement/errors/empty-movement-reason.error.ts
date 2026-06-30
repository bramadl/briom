import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when a `CreditMovement` is constructed without a human-readable
 * reason. Every balance movement must be traceable to a concrete cause —
 * an empty reason defeats the purpose of the audit log.
 */
export class EmptyMovementReasonError extends DomainError {
	public constructor() {
		super("Movement reason cannot be empty", { context: "CreditMovement" });
	}
}
