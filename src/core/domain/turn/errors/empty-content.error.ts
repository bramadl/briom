import { DomainError } from "@briom/libs/drimion";

export class EmptyContentError extends DomainError {
	public constructor() {
		super("Content cannot be empty", { context: "Turn" });
	}
}
