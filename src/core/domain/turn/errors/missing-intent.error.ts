import { DomainError } from "@briom/libs/drimion";

export class MissingIntentError extends DomainError {
	public constructor() {
		super("Participant turn must have intent", { context: "Turn" });
	}
}
