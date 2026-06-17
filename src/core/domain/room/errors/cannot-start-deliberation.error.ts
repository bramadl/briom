import { DomainError } from "@briom/libs/drimion";

export class CannotStartDeliberationError extends DomainError {
	public constructor(reason: string) {
		super(reason, { context: "Room" });
	}
}
