
import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when `saveSynthesis()` is invoked with unmet precondition.
 */
export class NoSynthesisInProgressError extends DomainError {
	public constructor() {
		super("No synthesis in progress", { context: "Room" });
	}
}
