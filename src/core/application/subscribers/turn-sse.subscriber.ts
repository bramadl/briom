import type {
	TurnFailedPayload,
	TurnSettledPayload,
	TurnStreamStartedPayload,
	TurnTokenAccumulatedPayload,
} from "@briom/domain/turn";
import type { DomainEvent } from "@briom/libs/drimion";

import type { ISseForwarder } from "../ports";

/**
 * @description
 * `TurnSseSubscriber` — Application Event Subscriber
 *
 * Listens to `Turn` domain events and forwards them to connected clients via SSE.
 * Handles the real-time streaming experience: tokens arriving, stream starting,
 * turn completing, and turn failing.
 *
 * **Event Contract**
 * All handlers accept `DomainEvent<TPayload>` — the base event type from
 * Drimion's event system.
 *
 * **Event Mapping**
 * - `TurnStreamStarted` → `turn:token`
 * - `TurnTokenAccumulated` → `turn:token`
 * - `TurnSettled` → `turn:settled`
 * - `TurnFailed` → `turn:failed`
 *
 * @see ISseForwarder — for SSE transport contract
 * @see DomainEvent — base event type from Drimion
 */
export class TurnSseSubscriber {
	public constructor(private readonly sse: ISseForwarder) {}

	/**
	 * @description
	 * Forwarded as `turn:token` with minimal payload.
	 */
	public onTurnStreamStarted(
		event: DomainEvent<TurnStreamStartedPayload>,
	): void {
		if (!event.payload) return;
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
	 */
	public onTurnTokenAccumulated(
		event: DomainEvent<TurnTokenAccumulatedPayload>,
	): void {
		if (!event.payload) return;
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
	 */
	public onTurnSettled(event: DomainEvent<TurnSettledPayload>): void {
		if (!event.payload) return;
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
	 */
	public onTurnFailed(event: DomainEvent<TurnFailedPayload>): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:failed",
			data: {
				turnId: event.payload.turnId.value(),
				error: event.payload.error,
			},
		});
	}
}
