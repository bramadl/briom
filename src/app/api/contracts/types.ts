export type ApiError =
	| { kind: "DOMAIN_INVARIANT"; message: string }
	| { kind: "NOT_FOUND"; message: string }
	| { kind: "MODEL_NOT_FOUND"; message: string }
	| { kind: "RATE_LIMITED"; message: string; retryAfter?: number }
	| { kind: "STREAM_FAILURE"; message: string }
	| { kind: "SERVER_ERROR"; message: string };

export type ServerActionResult<T> =
	| { success: true; data: T; error: null }
	| ServerActionError;

export type ServerActionError = {
	success: false;
	data: null;
	error: ApiError;
};

export type StreamEventError =
	| { kind: "MODEL_NOT_FOUND"; message: string }
	| { kind: "RATE_LIMITED"; message: string; retryAfter?: number }
	| { kind: "STREAM_FAILURE"; message: string }
	| { kind: "SERVER_ERROR"; message: string };
