import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to claim a turn slot while the Room is locked,
 * frozen, or another turn is already in progress.
 */
export class NotAcceptingTurnsError extends DomainError {
	public constructor() {
		super("Room is not currently accepting new turns", { context: "Room" });
	}
}
