import type { StreamError } from "@briom/core/domain";

/**
 * @description
 * Application-layer port to the Turn realtime channel.
 *
 * One method per topic rather than a single generic `publish(topic,
 * data)` — this keeps every call site's payload shape checked at the
 * call site itself, and keeps `TurnsEventSubscriber` (and
 * `StreamConsumer`) from needing to know the channel's topic *names*
 * as string literals.
 */
export interface ITurnRealtimePublisher {
	publishAbandoned(roomId: string, data: { turnId: string }): Promise<void>;

	/**
	 * @description
	 * Carries the full error detail (not just `kind`) so FE's
	 * `TurnFailed` card can render immediately off this message alone,
	 * without waiting on the `invalidateRoom()` refetch that fires
	 * alongside it. Mirrors `TurnFailedPayload.error`'s fields directly.
	 */
	publishFailed(
		roomId: string,
		data: {
			turnId: string;
			kind: StreamError;
			message: string;
			isRetryable?: boolean;
			retryAfter?: number;
		},
	): Promise<void>;

	publishInitiated(
		roomId: string,
		data: { turnId: string; sequence: number },
	): Promise<void>;

	/**
	 * @description
	 * Carries the full final content directly in the payload — same
	 * reasoning as publishFailed's inline error detail. Without this,
	 * FE has nothing to render the instant streaming stops except
	 * whatever partial content it last had accumulated locally, and has
	 * to wait on invalidateRoom()'s network round-trip just to see the
	 * complete text.
	 */
	publishSettled(
		roomId: string,
		data: { turnId: string; content: string },
	): Promise<void>;

	publishStreamStarted(roomId: string, data: { turnId: string }): Promise<void>;

	/**
	 * @description
	 * Non-durable, fire-and-forget from the caller's perspective — safe
	 * to call at high frequency (default: every 30ms while there's
	 * something new to send). `token` is a DELTA — the text received
	 * since the last publish, NOT the full accumulated content. Callers
	 * must append this to their own running total; this method carries
	 * no information about what's been sent before.
	 *
	 * Never awaited for its completion outside of the publish call
	 * itself; a dropped or duplicated publish here does not affect Turn
	 * state, which is the DB persist happening on its own cadence, not
	 * this broadcast.
	 */
	publishTokenAccumulated(
		roomId: string,
		data: { turnId: string; token: string },
	): Promise<void>;
}
