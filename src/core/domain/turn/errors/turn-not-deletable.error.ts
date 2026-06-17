import { DomainError } from "@briom/drimion";

export class TurnNotDeletableError extends DomainError {
	public constructor(turnId: string) {
		super(`Turn with id of "${turnId}" is settled and cannot be deleted`, {
			context: "Turn",
		});
	}
}
