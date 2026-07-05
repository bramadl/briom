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

	publishFailed(
		roomId: string,
		data: { turnId: string; errorKind: string },
	): Promise<void>;
	publishInitiated(
		roomId: string,
		data: { turnId: string; sequence: number },
	): Promise<void>;

	publishSettled(roomId: string, data: { turnId: string }): Promise<void>;

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
