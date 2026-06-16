/**
 * @description
 * Represents a infra-level error thrown when a business rule or invariant is violated.
 *
 * Unlike generic `Error`, `InfraError` carries structured context about where and why
 * the violation occurred, making it easier to handle, log, and surface meaningful
 * feedback to callers.
 *
 * Use `InfraError` whenever a infra operation fails due to an invariant violation —
 * for example, when `set().to()` receives an invalid value, or when a required infra
 * rule is not satisfied.
 *
 * @example
 * ```typescript
 * throw new InfraError('Amount must be positive', {
 *     field: 'amount',
 *     context: 'Money',
 * });
 * ```
 */
export abstract class InfraError extends Error {
	public readonly context?: string;

	/**
	 * @description
	 * Creates a new `InfraError` instance.
	 *
	 * @param message A human-readable description of the violation.
	 * @param options Optional structured context about the violation.
	 * @param options.context The infra class or context name where the error originated.
	 */
	constructor(
		message: string,
		options?: { field?: string; context?: string; cause?: unknown },
	) {
		const formattedMessage = options?.context
			? `[${options.context}] ${message}`
			: message;

		super(formattedMessage, { cause: options?.cause });
		this.name = "InfraError";
		this.context = options?.context;

		// Maintains proper stack trace in V8 environments (Node.js, Bun, Chrome)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
