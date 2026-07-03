/**
 * @description
 * Core contract for broadcasting realtime messages or events (Pub/Sub).
 * Used by the application layer to trigger outbound events without being coupled
 * to specific third-party providers (e.g., Supabase, Inngest, Socket.io).
 */
export interface IRealtimeBroadcaster {
	/**
	 * @description
	 * Broadcasts a data payload to a specific event within a designated channel.
	 */
	broadcast(
		channel: string,
		event: string,
		payload: Record<string, unknown>,
	): Promise<void>;
}
