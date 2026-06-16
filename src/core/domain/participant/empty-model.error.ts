import { DomainError } from "@briom/libs/drimion";

export class EmptyModelError extends DomainError {
	public constructor() {
		super("Model cannot be empty", { context: "Participant" });
	}
}
