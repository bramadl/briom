import type { STREAM_ERROR } from "@briom/domain";

export interface TurnErrorDTO {
	/**
	 * @description
	 * Error classification from STREAM_ERROR taxonomy.
	 */

	kind: (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR];
	/**
	 * @description
	 * Human-readable error description.
	 */

	message: string;
	/**
	 * @description
	 * ISO 8601 timestamp of failure.
	 */

	occurredAt: string;
	/**
	 * @description
	 * Optional retry-after duration in seconds (for rate limits).
	 */
	retryAfter?: number;
}
