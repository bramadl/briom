import { DomainError } from "@briom/libs/drimion";

export class DuplicateDisplayNameError extends DomainError {
	public constructor(name: string) {
		super(`Display name "${name}" already exists in room`, {
			context: "Participant",
		});
	}
}
