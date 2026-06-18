import type {
	DeliberationConcluded,
	DeliberationPaused,
	DeliberationResumed,
	DeliberationStarted,
	ParticipantInvited,
	RoomFormed,
	TurnRegistered,
} from "@briom/domain";

import type { ISseForwarder } from "../ports";

/**
 * @description
 * `RoomSseSubscriber` — Application Event Subscriber
 *
 * Listens to `Room` domain events and forwards them to connected clients via SSE.
 * Translates domain events into wire-friendly payloads while preserving
 * ubiquitous language in event names.
 *
 * **Why a Subscriber?**
 * Domain events (`RoomFormed`, `DeliberationStarted`, etc.) are pure data — they
 * carry no knowledge of HTTP or SSE. This subscriber bridges that gap: it
 * receives events from the event bus and decides how to present them to clients.
 *
 * **Event Mapping**
 * Domain events are mapped to SSE event names that clients understand:
 * - `RoomFormed` → `room:participant-joined` (creator implicitly joined)
 * - `ParticipantInvited` → `room:participant-joined`
 * - `DeliberationStarted` → `room:deliberation-started`
 * - `TurnRegistered` → `room:turn-registered`
 * - `DeliberationPaused` → `room:deliberation-paused`
 * - `DeliberationResumed` → `room:deliberation-resumed`
 * - `DeliberationConcluded` → `room:deliberation-concluded`
 *
 * **Shared Context Principle**
 * All events are broadcast to the room, not sent to specific users. Every
 * connected client sees the same deliberation state evolution.
 *
 * @see ISseForwarder — for SSE transport contract
 * @see Room — for event emission logic
 */
export class RoomSseSubscriber {
	public constructor(private readonly sse: ISseForwarder) {}

	/**
	 * @description
	 * Forwarded as `room:participant-joined`.
	 *
	 * Usually not needed for sync responses (form room returns room data),
	 * but included for completeness in event-driven clients.
	 */
	public onRoomFormed(event: RoomFormed): void {
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
	 *
	 * Signals that a new AI participant has entered the room.
	 */
	public onParticipantInvited(event: ParticipantInvited): void {
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
	 *
	 * Signals that deliberation has begun and turns can now be initiated.
	 */
	public onDeliberationStarted(event: DeliberationStarted): void {
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
	 *
	 * Signals that a new turn has been added to the deliberation history.
	 */
	public onTurnRegistered(event: TurnRegistered): void {
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
	 *
	 * Signals that the moderator has paused deliberation.
	 */
	public onDeliberationPaused(event: DeliberationPaused): void {
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
	 *
	 * Signals that the moderator has resumed deliberation.
	 */
	public onDeliberationResumed(event: DeliberationResumed): void {
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
	 *
	 * Signals that deliberation has ended. No further turns can be initiated.
	 */
	public onDeliberationConcluded(event: DeliberationConcluded): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-concluded",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}
}
