import { DomainError, ValueObject } from "@briom/libs/drimion";

import { STREAM_ERROR } from "./stream.error-map";

export interface StreamErrorProps {
	kind: (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR];
	message: string;
	occurredAt: Date;
	retryAfter?: number;
}

/**
 * @description
 * `StreamError` — Value Object
 *
 * Represents a failure during LLM streaming. Captures the error kind, message,
 * timestamp, and optional retry guidance for the application layer.
 *
 * **Why a Value Object?**
 * Stream errors are fully defined by their properties. Two identical errors
 * (same kind, message, timestamp) are interchangeable.
 */
export class StreamError extends ValueObject<StreamErrorProps> {
	private constructor(props: StreamErrorProps) {
		super(props);
	}

	/**
	 * @description
	 * Creates a timeout error for turns that exceed the duration threshold.
	 */
	public static timeout(message?: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.TIMEOUT,
			message: message || "Stream timed out waiting for model response",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates a rate limit error with optional retry-after guidance.
	 */
	public static rateLimited(retryAfter?: number): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.RATE_LIMITED,
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
	public static modelNotFound(model: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.MODEL_NOT_FOUND,
			message: `Model ${model} not found or unavailable.`,
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates a generic stream interruption error.
	 */
	public static streamFailure(message?: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.STREAM_FAILURE,
			message: message || "Stream was interrupted.",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates an error when the stream was aborted by moderator action.
	 */
	public static aborted(message?: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.ABORTED,
			message: message || "Stream aborted by moderator.",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Creates an error when the model returns empty content.
	 */
	public static emptyResponse(): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.EMPTY_RESPONSE,
			message: "Model returned an empty response.",
			occurredAt: new Date(),
		});
	}

	/**
	 * @description
	 * Rehydrates from persistence.
	 */
	public static rehydrate(props: StreamErrorProps): StreamError {
		return new StreamError(props);
	}

	/**
	 * @description
	 * Transform stream error into `DomainError` instance.
	 */
	public toDomainError(): DomainError {
		return new DomainError(this.get("message"), {
			context: this.get("kind"),
		});
	}
}
