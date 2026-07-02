/**
 * @description
 * High-level classifications for application errors, mapping directly to common transport statuses (HTTP codes).
 */
export type ApplicationErrorType =
	| "BAD_REQUEST"
	| "UNAUTHORIZED"
	| "PAYMENT_REQUIRED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "METHOD_NOT_ALLOWED"
	| "CONFLICT"
	| "UNPROCESSABLE_ENTITY"
	| "TOO_MANY_REQUESTS"
	| "UNEXPECTED"
	| "BAD_GATEWAY"
	| "SERVICE_UNAVAILABLE";

/**
 * @description
 * A strongly-typed, rich, and fluent Application Error object designed for the Drimion library ecosystem.
 * Formatted with FE-forwarding in mind: `message` is human-readable for direct UI rendering,
 * while `code` is automatically inferred from Domain class names for conditional logic.
 *
 * @example
 * // 1. Direct FE Forwarding (FE can just do: alert(error.message))
 * return Result.error(ApplicationError.notFound("We couldn't find that room. Please check the link."));
 *
 * // 2. Mapping Domain Error (Automatically sets code to "EMPTY_TITLE_ERROR" and forwards the domain message)
 * return Result.error(
 *   ApplicationError.badRequest(domainError.message).causedBy(domainError)
 * );
 */
export class ApplicationError {
	public readonly type: ApplicationErrorType;
	public readonly message: string;
	private privateCode?: string;
	private privateCause?: unknown;
	private privateDetails?: Record<string, unknown>;

	private constructor(type: ApplicationErrorType, message: string) {
		this.type = type;
		this.message = message;
	}

	/**
	 * @description
	 * Internal utility to convert PascalCase class names to SNAKE_CASE codes.
	 */
	private static pascalToSnakeCase(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, "$1_$2")
			.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
			.toUpperCase();
	}

	// =========================================================================
	// STATIC FACTORIES (Pass FE-friendly messages here)
	// =========================================================================

	/**
	 * @description
	 * 400: Constraint failed, malformed payload, input issues
	 */
	public static badRequest(message: string): ApplicationError {
		return new ApplicationError("BAD_REQUEST", message);
	}

	/**
	 * @description
	 * 401: Missing or invalid authentication session/token.
	 *
	 * @default
	 * "Please log in to continue."
	 */
	public static unauthorized(
		message: string = "Please log in to continue.",
	): ApplicationError {
		return new ApplicationError("UNAUTHORIZED", message);
	}

	/**
	 * @description
	 * 402: Insufficient credits, room frozen needing top-up.
	 *
	 * @default
	 * "Your balance is insufficient. Please top up."
	 */
	public static paymentRequired(
		message: string = "Your balance is insufficient. Please top up.",
	): ApplicationError {
		return new ApplicationError("PAYMENT_REQUIRED", message);
	}

	/**
	 * @description
	 * 403: Authenticated but lacks required permission/ownership.
	 *
	 * @default
	 * "You do not have permission to perform this action."
	 */
	public static forbidden(
		message: string = "You do not have permission to perform this action.",
	): ApplicationError {
		return new ApplicationError("FORBIDDEN", message);
	}

	/**
	 * @description
	 * 404: Aggregates, entities, or rows not found in persistence.
	 *
	 * @default
	 * "The requested resource was not found."
	 */
	public static notFound(
		message: string = "The requested resource was not found.",
	): ApplicationError {
		return new ApplicationError("NOT_FOUND", message);
	}

	/**
	 * @description
	 * 405: Unsupported transport or HTTP method invocation.
	 */
	public static methodNotAllowed(message: string): ApplicationError {
		return new ApplicationError("METHOD_NOT_ALLOWED", message);
	}

	/**
	 * @description
	 * 409: Concurrency race-conditions or unique index violations.
	 */
	public static conflict(message: string): ApplicationError {
		return new ApplicationError("CONFLICT", message);
	}

	/**
	 * @description
	 * 422: Valid syntax but syntactically/logically invalid business data.
	 */
	public static unprocessableEntity(message: string): ApplicationError {
		return new ApplicationError("UNPROCESSABLE_ENTITY", message);
	}

	/**
	 * @description
	 * 429: Rate-limiting thresholds breached.
	 */
	public static tooManyRequests(
		message: string = "Too many requests. Please slow down.",
	): ApplicationError {
		return new ApplicationError("TOO_MANY_REQUESTS", message);
	}

	/**
	 * @description
	 * 500: Internal runtime crashes, DB disconnection, third-party blips.
	 *
	 * @default
	 * "An unexpected server error occurred. Please try again later."
	 */
	public static unexpected(
		message: string = "An unexpected server error occurred. Please try again later.",
	): ApplicationError {
		return new ApplicationError("UNEXPECTED", message);
	}

	/**
	 * @description
	 * 502: Upstream proxy or server gateway communication breakdown.
	 */
	public static badGateway(message: string): ApplicationError {
		return new ApplicationError("BAD_GATEWAY", message);
	}

	/**
	 * @description
	 * 503: Critical server maintenance or temporary capacity overload.
	 *
	 * @default
	 * "Server is temporarily down for maintenance."
	 */
	public static serviceUnavailable(
		message: string = "Server is temporarily down for maintenance.",
	): ApplicationError {
		return new ApplicationError("SERVICE_UNAVAILABLE", message);
	}

	// =========================================================================
	// FLUENT MUTATORS (Chainable APIs)
	// =========================================================================

	/**
	 * @description
	 * Manually overrides the error code if you don't want to use the inferred Domain class name.
	 */
	public withCode(code: string): this {
		this.privateCode = code;
		return this;
	}

	/**
	 * @description
	 * Attaches dynamic validation payloads or extra error state contexts.
	 */
	public withDetails(details: Record<string, unknown>): this {
		this.privateDetails = { ...this.privateDetails, ...details };
		return this;
	}

	/**
	 * @description
	 * Binds the underlying Domain/DB exception and automatically extracts its class name into a SNAKE_CASE code.
	 */
	public causedBy(cause: unknown): this {
		this.privateCause = cause;

		if (cause && typeof cause === "object" && !this.privateCode) {
			const className = cause.constructor.name;
			if (
				className &&
				className !== "Object" &&
				className !== "Error" &&
				className !== "DomainError"
			) {
				this.privateCode = ApplicationError.pascalToSnakeCase(className);
			}
		}
		return this;
	}

	// =========================================================================
	// READERS & GETTERS (What the Transport Layer serializes to JSON)
	// =========================================================================

	public get code(): string {
		return this.privateCode ?? this.type;
	}

	public get details(): Record<string, unknown> {
		return this.privateDetails ?? {};
	}

	public get cause(): unknown | undefined {
		return this.privateCause;
	}

	public get httpStatus(): number {
		const statusMap: Record<ApplicationErrorType, number> = {
			BAD_REQUEST: 400,
			UNAUTHORIZED: 401,
			PAYMENT_REQUIRED: 402,
			FORBIDDEN: 403,
			NOT_FOUND: 404,
			METHOD_NOT_ALLOWED: 405,
			CONFLICT: 409,
			UNPROCESSABLE_ENTITY: 422,
			TOO_MANY_REQUESTS: 429,
			UNEXPECTED: 500,
			BAD_GATEWAY: 502,
			SERVICE_UNAVAILABLE: 503,
		};
		return statusMap[this.type];
	}

	/**
	 * @description
	 * Serializes the rich class into a plain object ready to be forwarded over the network.
	 */
	public toJSON() {
		return {
			type: this.type,
			code: this.code,
			message: this.message,
			details: this.details,
		};
	}
}
