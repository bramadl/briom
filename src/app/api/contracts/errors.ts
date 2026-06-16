import {
	EmptyContentError,
	EmptyDisplayNameError,
	EmptyModelError,
	EmptyRoomTitleError,
	NegativeSequenceError,
	ParticipantNotFoundError,
	RoomNotFoundError,
} from "@briom/domain";
import {
	ModelNotFoundError,
	RateLimitedError,
	StreamFailureError,
} from "@briom/open-router/errors";

import type { ApiError, StreamEventError } from "./types";

export function toServerActionError(error: unknown): ApiError {
	if (
		error instanceof EmptyRoomTitleError ||
		error instanceof EmptyModelError ||
		error instanceof EmptyDisplayNameError ||
		error instanceof EmptyContentError ||
		error instanceof NegativeSequenceError
	) {
		return { kind: "DOMAIN_INVARIANT", message: error.message };
	}

	if (
		error instanceof RoomNotFoundError ||
		error instanceof ParticipantNotFoundError
	) {
		return { kind: "NOT_FOUND", message: error.message };
	}

	if (error instanceof RateLimitedError) {
		return {
			kind: "RATE_LIMITED",
			message: error.message,
			retryAfter: error.retryAfter,
		};
	}

	if (error instanceof ModelNotFoundError) {
		return { kind: "MODEL_NOT_FOUND", message: error.message };
	}

	if (error instanceof StreamFailureError) {
		return { kind: "STREAM_FAILURE", message: error.message };
	}

	return { kind: "SERVER_ERROR", message: "Something went wrong." };
}

export function toStreamEventError(error: unknown): StreamEventError {
	if (error instanceof RateLimitedError) {
		return {
			kind: "RATE_LIMITED",
			message: error.message,
			retryAfter: error.retryAfter,
		};
	}

	if (error instanceof ModelNotFoundError) {
		return { kind: "MODEL_NOT_FOUND", message: error.message };
	}

	if (error instanceof StreamFailureError) {
		return { kind: "STREAM_FAILURE", message: error.message };
	}

	return { kind: "STREAM_FAILURE", message: "Stream was interrupted." };
}
