/**
 * @description
 * SSE event payload for broadcasting to room clients.
 *
 * Uses domain-native event names (e.g., "turn:token", "room:deliberation-started")
 * to preserve ubiquitous language across the wire.
 */
export interface SseEvent {
	/**
	 * @description Event payload — typically DTOs or primitive data. */
	data: unknown;

	/**
	 * @description Domain event name or UI event identifier. */
	event: string;
}

/**
 * @description
 * `ISseForwarder` — Application Port
 *
 * Contract for forwarding domain events to connected clients via Server-Sent Events.
 * Bridges the internal event bus (domain events) with the HTTP transport layer
 * (SSE connections from browser/mobile clients).
 *
 * **Why a Port?**
 * SSE is an infrastructure concern (HTTP, connections, protocols). The domain
 * shouldn't know about it. The application layer defines what needs to be
 * forwarded (which events, to which rooms) but delegates how to the infrastructure.
 *
 * **Broadcast Model**
 * Events are broadcast to all clients connected to a room. This matches Briom's
 * shared context principle: all participants (and the moderator) see the same
 * deliberation state evolve in real time.
 *
 * **Event Naming**
 * Forwarded events use domain-native names:
 * - `turn:token` — token accumulated (not "message:chunk")
 * - `turn:settled` — turn completed (not "message:sent")
 * - `room:deliberation-started` — deliberation began (not "chat:started")
 *
 * @see RoomSseSubscriber — subscriber that forwards room events
 * @see TurnSseSubscriber — subscriber that forwards turn events
 * @see BriomSseForwarder — infrastructure implementation
 */
export interface ISseForwarder {
	/**
	 * @description
	 * Broadcasts an event to all clients connected to a room.
	 *
	 * @param roomId - The target room
	 * @param event - The event to forward
	 */
	broadcastToRoom(roomId: string, event: SseEvent): void;

	/**
	 * @description
	 * Sends an event to a specific client.
	 *
	 * Used for connection-level events (e.g., initial connection ack).
	 *
	 * @param clientId - The target client
	 * @param event - The event to forward
	 */
	sendToClient(clientId: string, event: SseEvent): void;

	/**
	 * @description
	 * Registers a client connection to a room and returns the SSE Response.
	 *
	 * The returned Response is used by the HTTP framework to establish
	 * the text/event-stream connection.
	 *
	 * @param clientId - Unique client identifier
	 * @param roomId - Room to subscribe to
	 * @returns HTTP Response with SSE stream
	 */
	subscribeClient(clientId: string, roomId: string): Response;

	/**
	 * @description
	 * Removes a client connection and cleans up resources.
	 *
	 * @param clientId - The client to disconnect
	 */
	unsubscribeClient(clientId: string): void;
}
