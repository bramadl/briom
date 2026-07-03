import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when a `CreditUsage` is constructed with an invalid value —
 * negative token counts or negative cost. These should never originate
 * from a real OpenRouter response; this guards against a malformed
 * payload silently corrupting usage accounting.
 */
export class InvalidUsageError extends DomainError {
	public constructor(reason: string) {
		super(`Invalid turn usage: ${reason}`, { context: "TurnUsage" });
	}
}
