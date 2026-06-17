import { DomainError } from "@briom/drimion";

export class TurnNotFoundError extends DomainError {
	public constructor(turnId: string) {
		super(`Turn with id of "${turnId}" cannot be found`, { context: "Turn" });
	}
}
