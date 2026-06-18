import type {
	TurnFailed,
	TurnSettled,
	TurnStreamStarted,
	TurnTokenAccumulated,
} from "@briom/domain/turn";

import type { ISseForwarder } from "../ports";

/**
 * @description
 * `TurnSseSubscriber` — Application Event Subscriber
 *
 * Listens to `Turn` domain events and forwards them to connected clients via SSE.
 * Handles the real-time streaming experience: tokens arriving, stream starting,
 * turn completing, and turn failing.
 *
 * **Why Separate from RoomSseSubscriber?**
 * Turn events are high-frequency during streaming (one per token) and have
 * different payload shapes. Separating them keeps concerns clean and allows
 * independent scaling or filtering.
 *
 * **Event Mapping**
 * - `TurnStreamStarted` → `turn:token` (minimal payload, signals transition)
 * - `TurnTokenAccumulated` → `turn:token` (carries actual token text)
 * - `TurnSettled` → `turn:settled` (carries complete content)
 * - `TurnFailed` → `turn:failed` (carries error details)
 *
 * **Real-Time Experience**
 * The `turn:token` event is the heartbeat of Briom's "intellectually alive"
 * feeling. Each token pushes to the client immediately, creating the sensation
 * of watching a thought form in real time.
 *
 * @see ISseForwarder — for SSE transport contract
 * @see Turn — for event emission logic
 * @see TurnLifecycleOrchestrator — for event generation timing
 */
export class TurnSseSubscriber {
	public constructor(private readonly sse: ISseForwarder) {}

	/**
	 * @description
	 * Forwarded as `turn:token` with minimal payload.
	 *
	 * Signals the transition from "thinking" to "streaming" in the UI.
	 * Client can use this to show a typing indicator or stream container.
	 */
	public onTurnStreamStarted(event: TurnStreamStarted): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:token",
			data: {
				turnId: event.payload.turnId.value(),
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `turn:token` with token content.
	 *
	 * The primary real-time event. Each token from the LLM stream is
	 * immediately pushed to all connected room clients.
	 */
	public onTurnTokenAccumulated(event: TurnTokenAccumulated): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:token",
			data: {
				turnId: event.payload.turnId.value(),
				token: event.payload.token,
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `turn:settled`.
	 *
	 * Signals that streaming is complete and the full perspective is available.
	 * Client can replace the streaming view with the settled content.
	 */
	public onTurnSettled(event: TurnSettled): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:settled",
			data: {
				turnId: event.payload.turnId.value(),
				content: event.payload.content,
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `turn:failed`.
	 *
	 * Signals that the turn encountered an error. Client can show retry/abandon
	 * options to the moderator.
	 */
	public onTurnFailed(event: TurnFailed): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:failed",
			data: {
				turnId: event.payload.turnId.value(),
				error: event.payload.error,
			},
		});
	}
}
