/**
 * @description
 * Taxonomy of stream error kinds.
 *
 * Used by `StreamError` to classify failures and by the application layer
 * to determine retry strategy (e.g., rate_limited → retry with backoff,
 * model_not_found → fail immediately).
 */
export const STREAM_ERROR = {
	/**
	 * @description
	 * Turn exceeded maximum duration threshold.
	 */
	TIMEOUT: "timeout",
	/**
	 * @description
	 * Provider rate limit hit; retry after specified duration.
	 */
	RATE_LIMITED: "rate_limited",
	/**
	 * @description
	 * Requested model identifier not recognized by provider.
	 */
	MODEL_NOT_FOUND: "model_not_found",
	/**
	 * @description
	 * Generic stream interruption (network, parsing, etc.).
	 */
	STREAM_FAILURE: "stream_failure",
	/**
	 * @description
	 * Stream terminated by moderator intervention.
	 */
	ABORTED: "aborted",
	/**
	 * @description
	 * Model returned empty or whitespace-only content.
	 */
	EMPTY_RESPONSE: "empty_response",
} as const;
