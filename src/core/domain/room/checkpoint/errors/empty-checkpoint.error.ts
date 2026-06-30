import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export class EmptyCheckpointError extends DomainError {
	public constructor() {
		super("Checkpoint cannot be empty", { context: "Checkpoint" });
	}
}
