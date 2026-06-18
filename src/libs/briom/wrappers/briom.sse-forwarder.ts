import type { ISseForwarder, SseEvent } from "@briom/core/application";

/**
 * @description
 * Client connection state for SSE.
 *
 * Holds the `ReadableStream` controller and the HTTP Response object
 * for sending events to a connected browser/client.
 */
interface ClientConnection {
	/**
	 * @description
	 * Stream controller for enqueueing events.
	 */

	controller: ReadableStreamDefaultController<string>;
	/**
	 * @description
	 * HTTP Response with SSE headers.
	 */
	response: Response;
}

/**
 * @description
 * `BriomSseForwarder` — Infrastructure SSE Transport
 *
 * `Server-Sent Events` implementation using native `Web Streams API`.
 * Manages client connections per room and broadcasts domain events
 * to all connected clients.
 *
 * **Connection Model**
 * - Clients subscribe to a specific room via HTTP request
 * - Each client gets a unique clientId
 * - Events are broadcast to all clients in the same room
 * - Connection cleanup happens on client disconnect or error
 *
 * **Memory Management**
 * - Client connections are tracked in two Maps for bidirectional lookup
 * - Disconnected clients are automatically removed
 * - Empty rooms are cleaned up to prevent memory leaks
 *
 * **Event Format**
 * ```
 * event: turn:token\ndata: {"turnId": "...", "token": "..."}\n\n
 * ```
 *
 * **Why Native Streams?**
 * No dependencies beyond Node.js/built-in APIs. Works in:
 * - Node.js 18+ (with fetch/streams)
 * - Deno
 * - Bun
 * - Edge runtimes (Vercel, Cloudflare)
 *
 * @see ISseForwarder — domain contract
 * @see RoomSseSubscriber — for room event forwarding
 * @see TurnSseSubscriber — for turn event forwarding
 */
export class BriomSseForwarder implements ISseForwarder {
	/**
	 * @description
	 * clientId → roomId mapping for reverse lookup.
	 */
	private readonly clientRooms = new Map<string, string>();

	/**
	 * @description
	 * roomId → Map<<clientId, ClientConnection> for broadcast targeting.
	 */
	private readonly roomClients = new Map<
		string,
		Map<string, ClientConnection>
	>();

	/**
	 * @description
	 * Registers a client connection to a room and returns SSE Response.
	 *
	 * Creates a ReadableStream with SSE headers and sends an initial
	 * connection acknowledgment event.
	 *
	 * @param clientId - Unique client identifier
	 * @param roomId - Room to subscribe to
	 * @returns HTTP Response with SSE stream
	 */
	public subscribeClient(clientId: string, roomId: string): Response {
		const stream = new ReadableStream<string>({
			start: (controller) => {
				const room = this.roomClients.get(roomId) || new Map();
				room.set(clientId, {
					controller,
					response: null as unknown as Response,
				});

				this.roomClients.set(roomId, room);
				this.clientRooms.set(clientId, roomId);

				// Send initial connection event
				this.sendToClient(clientId, {
					event: "sse:connected",
					data: { clientId, roomId },
				});
			},
			cancel: () => {
				this.unsubscribeClient(clientId);
			},
		});

		const response = new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});

		return response;
	}

	/**
	 * @description
	 * Broadcasts an event to all clients connected to a room.
	 *
	 * @param roomId - Target room
	 * @param event - Event to broadcast
	 */
	public broadcastToRoom(roomId: string, event: SseEvent): void {
		const room = this.roomClients.get(roomId);
		if (!room) return;

		const payload = this.formatSseEvent(event);
		for (const [clientId, connection] of room) {
			try {
				connection.controller.enqueue(payload);
			} catch (error) {
				console.error(
					`[SseForwarder] Failed to send to client ${clientId}`,
					error,
				);
				this.unsubscribeClient(clientId);
			}
		}
	}

	/**
	 * @description
	 * Sends an event to a specific client.
	 *
	 * @param clientId - Target client
	 * @param event - Event to send
	 */
	public sendToClient(clientId: string, event: SseEvent): void {
		const roomId = this.clientRooms.get(clientId);
		if (!roomId) return;

		const room = this.roomClients.get(roomId);
		if (!room) return;

		const connection = room.get(clientId);
		if (!connection) return;

		try {
			connection.controller.enqueue(this.formatSseEvent(event));
		} catch (error) {
			console.error(
				`[SseForwarder] Failed to send to client ${clientId}`,
				error,
			);
			this.unsubscribeClient(clientId);
		}
	}

	/**
	 * @description
	 * Removes a client connection and cleans up resources.
	 *
	 * Closes the stream controller, removes from tracking Maps, and
	 * deletes empty rooms to prevent memory leaks.
	 *
	 * @param clientId - Client to disconnect
	 */
	public unsubscribeClient(clientId: string): void {
		const roomId = this.clientRooms.get(clientId);
		if (!roomId) return;

		const room = this.roomClients.get(roomId);
		if (room) {
			const connection = room.get(clientId);
			if (connection) {
				try {
					connection.controller.close();
				} catch {
					// Already closed
				}
				room.delete(clientId);
			}

			if (room.size === 0) this.roomClients.delete(roomId);
		}

		this.clientRooms.delete(clientId);
	}

	/**
	 * @description
	 * Formats an event into SSE wire format.
	 *
	 * @param event - Event to format
	 * @returns SSE-formatted string
	 */
	private formatSseEvent(event: SseEvent): string {
		return `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
	}
}
