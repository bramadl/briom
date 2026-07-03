import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to settle a turn with empty or whitespace-only content.
 * A perspective must contain actual reasoning to be considered valid.
 */
export class EmptyPerspectiveError extends DomainError {
	public constructor() {
		super("Perspective cannot be empty when settled", {
			context: "Turn",
		});
	}
}
