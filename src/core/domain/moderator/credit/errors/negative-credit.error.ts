import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when Briom Credit balance is below 0.
 */
export class NegativeCreditError extends DomainError {
	public constructor() {
		super("Credit balance cannot be negative", { context: "BriomCredit" });
	}
}
