export interface SseEvent {
	data: unknown;
	event: string;
}

export interface ISseForwarder {
	/**
	 * Forward event to all clients connected to a room
	 */
	broadcastToRoom(roomId: string, event: SseEvent): void;

	/**
	 * Forward event to specific client (if needed)
	 */
	sendToClient(clientId: string, event: SseEvent): void;

	/**
	 * Register client connection to room
	 */
	subscribeClient(clientId: string, roomId: string): void;

	/**
	 * Remove client connection
	 */
	unsubscribeClient(clientId: string): void;
}
