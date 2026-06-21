import type {
	TurnFailedPayload as DomainTurnFailedPayload,
	TurnInitiatedPayload as DomainTurnInitiatedPayload,
	TurnSettledPayload as DomainTurnSettledPayload,
	TurnStreamStartedPayload as DomainTurnStreamStartedPayload,
	TurnTokenAccumulatedPayload as DomainTurnTokenAccumulatedPayload,
} from "@briom/domain/turn";
import type { DomainEvent } from "@briom/libs/drimion";

import type { ISseForwarder } from "../ports";

import type {
	TurnFailedPayload,
	TurnInitiatedPayload,
	TurnSettledPayload,
	TurnStreamStartedPayload,
	TurnTokenPayload,
} from "./contracts/turn.payload";

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
	 * Forwarded as `turn:failed`.
	 */
	public async onTurnFailed(
		event: DomainEvent<DomainTurnFailedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:failed",
			data: {
				turnId: event.payload.turnId.value(),
				error: event.payload.error.toObject(),
			},
		} satisfies { event: string; data: TurnFailedPayload });
	}

	/**
	 * @description
	 * Forwarded as `turn:initiated` with minimal payload.
	 */
	public async onTurnInitiated(
		event: DomainEvent<DomainTurnInitiatedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:initiated",
			data: {
				turnId: event.payload.turnId.value(),
				authorType: event.payload.authorType,
				roomId: event.payload.roomId.value(),
				sequence: event.payload.sequence.get("value"),
				moderatorId: event.payload.moderatorId?.value() ?? null,
				participantId: event.payload.participantId?.value() ?? null,
				intent: event.payload.intent,
				clientTurnId: event.payload.clientTurnId,
			},
		} satisfies { event: string; data: TurnInitiatedPayload });
	}

	/**
	 * @description
	 * Forwarded as `turn:settled`.
	 */
	public async onTurnSettled(
		event: DomainEvent<DomainTurnSettledPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:settled",
			data: {
				turnId: event.payload.turnId.value(),
				content: event.payload.content,
			},
		} satisfies { event: string; data: TurnSettledPayload });
	}

	/**
	 * @description
	 * Forwarded as `turn:token` with minimal payload.
	 */
	public async onTurnStreamStarted(
		event: DomainEvent<DomainTurnStreamStartedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:started",
			data: { turnId: event.payload.turnId.value() },
		} satisfies { event: string; data: TurnStreamStartedPayload });
	}

	/**
	 * @description
	 * Forwarded as `turn:token` with token content.
	 */
	public async onTurnTokenAccumulated(
		event: DomainEvent<DomainTurnTokenAccumulatedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:token",
			data: {
				turnId: event.payload.turnId.value(),
				token: event.payload.token,
			},
		} satisfies { event: string; data: TurnTokenPayload });
	}
}
