import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when a participant turn is created without an intent.
 * All participant turns must have intent to guide LLM reasoning.
 */
export class MissingIntentError extends DomainError {
	public constructor() {
		super("Participant turn must have intent", { context: "Turn" });
	}
}
