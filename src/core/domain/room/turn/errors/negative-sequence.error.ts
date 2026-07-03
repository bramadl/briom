import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when creating a turn with sequence < 1.
 * Turn sequences start at 1 and increase monotonically.
 */
export class NegativeSequenceError extends DomainError {
	public constructor() {
		super("Sequence number cannot be negative", { context: "Turn" });
	}
}
