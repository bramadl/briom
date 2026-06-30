import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export class InvalidUsageError extends DomainError {
	public constructor(reason: string) {
		super(`Invalid turn usage: ${reason}`, { context: "TurnUsage" });
	}
}
