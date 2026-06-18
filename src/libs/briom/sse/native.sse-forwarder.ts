import type { ISseForwarder, SseEvent } from "@briom/core/application";

interface ClientConnection {
	controller: ReadableStreamDefaultController<string>;
	response: Response;
}

export class NativeSseForwarder implements ISseForwarder {
	private readonly clientRooms = new Map<string, string>();
	private readonly roomClients = new Map<
		string,
		Map<string, ClientConnection>
	>();

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

	private formatSseEvent(event: SseEvent): string {
		return `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
	}
}
