import { DomainError } from "@briom/libs/drimion";

export class EmptyDisplayNameError extends DomainError {
	public constructor() {
		super("Display name cannot be empty", { context: "Participant" });
	}
}
