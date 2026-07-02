import { DomainError, ValueObject } from "@briom/libs/drimion";

import { StreamError } from "./errors";

interface TurnErrorProps {
	/**
	 * @description
	 * Classification of the failure — drives retry strategy in the application layer.
	 */
	kind: StreamError;

	/**
	 * @description
	 * Human-readable description of what went wrong.
	 */
	message: string;

	/**
	 * @description
	 * When this failure occurred.
	 */
	occurredAt: Date;

	/**
	 * @description
	 * Seconds to wait before retrying, if the provider specified one (e.g. rate limits).
	 */
	retryAfter?: number;
}

/**
 * @description
 * `TurnError` — Value Object
 *
 * Represents a failure during LLM streaming. Captures the error kind, message,
 * timestamp, and optional retry guidance for the application layer.
 */
export class TurnError extends ValueObject<TurnErrorProps> {
	private constructor(props: TurnErrorProps) {
		super(props);
	}

	/**
	 * @description
	 * Creates a timeout error for turns that exceed the duration threshold.
	 */
	public static timeout(message?: string): TurnError {
		return new TurnError({
			kind: StreamError.TIMEOUT,
			message: message || "Stream timed out waiting for model response",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates a rate limit error with optional retry-after guidance.
	 */
	public static rateLimited(retryAfter?: number): TurnError {
		return new TurnError({
			kind: StreamError.RATE_LIMITED,
			message: retryAfter
				? `Rate limited. Retry after ${retryAfter} seconds.`
				: "Rate limited.",
			retryAfter,
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates an error when the requested model is unavailable.
	 */
	public static modelNotFound(model?: string): TurnError {
		return new TurnError({
			kind: StreamError.MODEL_NOT_FOUND,
			message: model
				? `Model ${model} not found or unavailable.`
				: "Model not found or unavailable.",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates a generic stream interruption error.
	 */
	public static streamFailure(message?: string): TurnError {
		return new TurnError({
			kind: StreamError.STREAM_FAILURE,
			message: message || "Stream was interrupted.",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates an error when the stream was aborted by moderator action.
	 */
	public static aborted(message?: string): TurnError {
		return new TurnError({
			kind: StreamError.ABORTED,
			message: message || "Stream aborted by moderator.",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates an error when the model returns empty content.
	 */
	public static emptyResponse(): TurnError {
		return new TurnError({
			kind: StreamError.EMPTY_RESPONSE,
			message: "Model returned an empty response.",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Classification of the failure.
	 */
	public get kind(): StreamError {
		return this.get("kind");
	}

	/**
	 * @description
	 * Human-readable description of what went wrong.
	 */
	public get message(): string {
		return this.get("message");
	}

	/**
	 * @description
	 * Seconds to wait before retrying, if specified by the provider.
	 */
	public get retryAfter(): number | undefined {
		return this.get("retryAfter");
	}

	/**
	 * @description
	 * True if the application layer should offer a retry for this failure.
	 */
	public get isRetryable(): boolean {
		return (
			this.kind === StreamError.RATE_LIMITED ||
			this.kind === StreamError.TIMEOUT ||
			this.kind === StreamError.STREAM_FAILURE
		);
	}

	/**
	 * @description
	 * Converts this stream error into a generic DomainError for Result propagation.
	 */
	public toDomainError(): DomainError {
		return new DomainError(this.get("message"), {
			context: this.get("kind"),
		});
	}
}
