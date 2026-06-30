import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to create a `Checkpoint` with empty content.
 * A checkpoint exists to carry a summary forward — an empty one carries
 * nothing and would silently drop everything it was meant to preserve.
 */
export class EmptyCheckpointError extends DomainError {
	public constructor() {
		super("Checkpoint cannot be empty", { context: "Checkpoint" });
	}
}
