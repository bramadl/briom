import { DomainError } from "@briom/libs/drimion";

export class NegativeSequenceError extends DomainError {
	public constructor() {
		super("Sequence number cannot be negative", { context: "Turn" });
	}
}
