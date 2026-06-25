
import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when synthesizing process encountered issues.
 */
export class CannotSynthesizeError extends DomainError {
	public constructor(reason?: string) {
		super(reason || "Cannot synthesize deliberation", { context: "Room" });
	}
}
