import type {
	DeliberationConcludedPayload,
	DeliberationPausedPayload,
	DeliberationResumedPayload,
	DeliberationStartedPayload,
	ParticipantInvitedPayload,
	RoomFormedPayload,
	TurnRegisteredPayload,
} from "@briom/domain";
import type { DomainEvent } from "@briom/libs/drimion";

import type { ISseForwarder } from "../ports";

/**
 * @description
 * `RoomSseSubscriber` — Application Event Subscriber
 *
 * Listens to `Room` domain events and forwards them to connected clients via SSE.
 * Translates domain events into wire-friendly payloads while preserving
 * ubiquitous language in event names.
 *
 * **Event Contract**
 * All handlers accept `DomainEvent<TPayload>` — the base event type from
 * Drimion's event system. This ensures compatibility with `BriomEventBus`
 * and any future event transport implementations.
 *
 * **Event Mapping**
 * - `RoomFormed` → `room:participant-joined`
 * - `ParticipantInvited` → `room:participant-joined`
 * - `DeliberationStarted` → `room:deliberation-started`
 * - `TurnRegistered` → `room:turn-registered`
 * - `DeliberationPaused` → `room:deliberation-paused`
 * - `DeliberationResumed` → `room:deliberation-resumed`
 * - `DeliberationConcluded` → `room:deliberation-concluded`
 *
 * @see ISseForwarder — for SSE transport contract
 * @see DomainEvent — base event type from Drimion
 */
export class RoomSseSubscriber {
	public constructor(private readonly sse: ISseForwarder) {}

	/**
	 * @description
	 * Forwarded as `room:participant-joined`.
	 */
	public onRoomFormed(event: DomainEvent<RoomFormedPayload>): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:participant-joined",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `room:participant-joined`.
	 */
	public onParticipantInvited(
		event: DomainEvent<ParticipantInvitedPayload>,
	): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:participant-joined",
			data: {
				roomId: event.payload.roomId.value(),
				participantId: event.payload.participantId.value(),
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `room:deliberation-started`.
	 */
	public onDeliberationStarted(
		event: DomainEvent<DeliberationStartedPayload>,
	): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-started",
			data: {
				roomId: event.payload.roomId.value(),
				topic: event.payload.topic,
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `room:turn-registered`.
	 */
	public onTurnRegistered(event: DomainEvent<TurnRegisteredPayload>): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:turn-registered",
			data: {
				roomId: event.payload.roomId.value(),
				turnId: event.payload.turnId.value(),
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `room:deliberation-paused`.
	 */
	public onDeliberationPaused(
		event: DomainEvent<DeliberationPausedPayload>,
	): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-paused",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `room:deliberation-resumed`.
	 */
	public onDeliberationResumed(
		event: DomainEvent<DeliberationResumedPayload>,
	): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-resumed",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}

	/**
	 * @description
	 * Forwarded as `room:deliberation-concluded`.
	 */
	public onDeliberationConcluded(
		event: DomainEvent<DeliberationConcludedPayload>,
	): void {
		if (!event.payload) return;
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-concluded",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}
}
