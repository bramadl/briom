import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when a moderator has exceeded their monthly participant turn limit.
 */
export class TurnLimitExceededError extends DomainError {
	public constructor(used: number, limit: number) {
		super(
			`Monthly turn limit reached (${used}/${limit}). Limit resets at the start of next month.`,
			{ context: "TurnLimit" },
		);
	}
}
