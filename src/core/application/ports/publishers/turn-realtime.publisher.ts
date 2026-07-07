import type { StreamError } from "@briom/core/domain";

/**
 * @description
 * Application-layer port to the Turn realtime channel. Replaces
 * `IRealtimeBroadcaster` for Turn concerns specifically — that port
 * stays alive for Room events (still Supabase Realtime), but Turn
 * events are high-frequency enough (per-flush token streaming) that a
 * generic `broadcast(channel, event, payload)` string API no longer
 * fits: each topic here is typed against `turnChannel`'s schema
 * instead of being assembled by hand.
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
	 * whatever partial content it last had in liveContent, and has to
	 * wait on invalidateRoom()'s network round-trip just to see the
	 * complete text. That round-trip gap is what produced the visible
	 * "cut off, then jumps to full text" artifact.
	 */
	publishSettled(
		roomId: string,
		data: { turnId: string; content: string },
	): Promise<void>;

	publishStreamStarted(roomId: string, data: { turnId: string }): Promise<void>;

	/**
	 * @description
	 * Non-durable, fire-and-forget from the caller's perspective — safe
	 * to call at flush-interval frequency. Never awaited for its
	 * completion outside of the publish call itself; a dropped or
	 * duplicated publish here does not affect Turn state, which is the
	 * DB persist happening alongside it, not this broadcast.
	 */
	publishTokenAccumulated(
		roomId: string,
		data: { turnId: string; content: string },
	): Promise<void>;
}
