import { DomainError } from "@briom/libs/drimion";

export class EmptyPerspectiveError extends DomainError {
	public constructor() {
		super("Perspective cannot be empty when settled", {
			context: "Perspective",
		});
	}
}
