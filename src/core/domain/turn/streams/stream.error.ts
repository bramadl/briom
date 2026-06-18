import { ValueObject } from "@briom/libs/drimion";

import { STREAM_ERROR } from "./stream.error-map";

interface StreamErrorProps {
	kind: (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR];
	message: string;
	occurredAt: Date;
	retryAfter?: number;
}

export class StreamError extends ValueObject<StreamErrorProps> {
	private constructor(props: StreamErrorProps) {
		super(props);
	}

	public static timeout(message?: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.TIMEOUT,
			message: message || "Stream timed out waiting for model response",
			occurredAt: new Date(),
		});
	}

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

	public static modelNotFound(model: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.MODEL_NOT_FOUND,
			message: `Model ${model} not found or unavailable.`,
			occurredAt: new Date(),
		});
	}

	public static streamFailure(message?: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.STREAM_FAILURE,
			message: message || "Stream was interrupted.",
			occurredAt: new Date(),
		});
	}

	public static aborted(message?: string): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.ABORTED,
			message: message || "Stream aborted by moderator.",
			occurredAt: new Date(),
		});
	}

	public static emptyResponse(): StreamError {
		return new StreamError({
			kind: STREAM_ERROR.EMPTY_RESPONSE,
			message: "Model returned an empty response.",
			occurredAt: new Date(),
		});
	}

	public static rehydrate(props: StreamErrorProps): StreamError {
		return new StreamError(props);
	}
}
