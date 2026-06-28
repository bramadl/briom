import type { ISseForwarder, SseEvent } from "@briom/core/application";
import { supabaseAdmin } from "@briom/supabase/admin";

/**
 * @description
 * `SupabaseSseForwarder` — Infrastructure Realtime Transport
 *
 * Publishes domain events to Supabase Realtime Broadcast channels via the
 * REST broadcast endpoint, scoped per room. Replaces the in-memory
 * `BriomSseForwarder`, which cannot survive across serverless function
 * instances (Vercel) or HMR module reloads (dev).
 *
 * **Why httpSend(), not send()?**
 * `channel.send()` only uses WebSocket if the channel has already
 * completed a `.subscribe()` handshake — otherwise it silently falls
 * back to REST per-call (a behavior now flagged for deprecation). For a
 * process that never holds a long-lived subscribed channel (every
 * request here is a fresh, stateless call), relying on that implicit
 * fallback meant each token publish carried unnecessary overhead.
 * `httpSend()` is the explicit, supported way to broadcast over REST
 * without any WebSocket/channel state — exactly what a stateless
 * backend needs.
 *
 * **No Connection State**
 * This adapter holds no in-memory client maps and no subscribed channel.
 * Each `broadcastToRoom` call is a single independent HTTP request to
 * Supabase's Realtime REST API. That's what makes it safe across
 * serverless instances, HMR reloads, and concurrent token streams.
 *
 * @see ISseForwarder — domain contract (kept for compatibility; the
 *      `subscribeClient`/`unsubscribeClient` methods are vestigial here
 *      since clients connect directly to Supabase, not through our server)
 */
export class SupabaseSseForwarder implements ISseForwarder {
	/**
	 * @description
	 * Publishes an event to all clients subscribed to a room's channel,
	 * via a single stateless REST call (no WebSocket handshake).
	 *
	 * Awaited by the caller — this guarantees that by the time this
	 * resolves, the event has actually left the process over the wire.
	 * Callers that need ordering between broadcasts (e.g. `turn:initiated`
	 * before `turn:token`) MUST await each call in sequence.
	 */
	public async broadcastToRoom(roomId: string, event: SseEvent): Promise<void> {
		const channel = supabaseAdmin.channel(this.channelName(roomId));

		try {
			await channel.httpSend(event.event, event.data);
		} catch (error) {
			console.error(
				`[SupabaseSseForwarder] Failed to broadcast to room ${roomId}`,
				error,
			);
		}
	}

	public sendToClient(): void {
		// Intentionally no-op — see class doc.
	}

	public subscribeClient(): Response {
		throw new Error(
			"[SupabaseSseForwarder] subscribeClient is not supported — clients connect directly to Supabase Realtime. Remove callers of this method.",
		);
	}

	public unsubscribeClient(): void {
		// Intentionally no-op — see class doc.
	}

	private channelName(roomId: string): string {
		return `room:${roomId}`;
	}
}
