import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to rename a participant to a display name already
 * used by another participant in the same room.
 *
 * Display names must be unique within a room for clear attribution of turns.
 */
export class DuplicateDisplayNameError extends DomainError {
	public constructor(name: string) {
		super(`Display name "${name}" already exists in room`, {
			context: "Participant",
		});
	}
}
