import type {
	DeliberationConcludedPayload,
	DeliberationPausedPayload,
	DeliberationResumedPayload,
	DeliberationStartedPayload,
	RoomFormedPayload as DomainRoomFormedPayload,
	ParticipantInvitedPayload,
	TurnRegisteredPayload,
} from "@briom/domain";
import type { DomainEvent } from "@briom/libs/drimion";

import type { ISseForwarder } from "../ports";

import type {
	RoomDeliberationConcludedPayload,
	RoomDeliberationPausedPayload,
	RoomDeliberationResumedPayload,
	RoomDeliberationStartedPayload,
	RoomFormedPayload,
	RoomParticipantJoinedPayload,
	RoomTurnRegisteredPayload,
} from "./contracts/room.payload";

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
	 * Forwarded as `room:deliberation-concluded`.
	 */
	public async onDeliberationConcluded(
		event: DomainEvent<DeliberationConcludedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-concluded",
			data: {
				roomId: event.payload.roomId.value(),
			},
		} satisfies { event: string; data: RoomDeliberationConcludedPayload });
	}

	/**
	 * @description
	 * Forwarded as `room:deliberation-paused`.
	 */
	public async onDeliberationPaused(
		event: DomainEvent<DeliberationPausedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-paused",
			data: {
				roomId: event.payload.roomId.value(),
			},
		} satisfies { event: string; data: RoomDeliberationPausedPayload });
	}

	/**
	 * @description
	 * Forwarded as `room:deliberation-resumed`.
	 */
	public async onDeliberationResumed(
		event: DomainEvent<DeliberationResumedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-resumed",
			data: {
				roomId: event.payload.roomId.value(),
			},
		} satisfies { event: string; data: RoomDeliberationResumedPayload });
	}

	/**
	 * @description
	 * Forwarded as `room:deliberation-started`.
	 */
	public async onDeliberationStarted(
		event: DomainEvent<DeliberationStartedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-started",
			data: {
				roomId: event.payload.roomId.value(),
				topic: event.payload.topic,
			},
		} satisfies { event: string; data: RoomDeliberationStartedPayload });
	}

	/**
	 * @description
	 * Forwarded as `room:participant-joined`.
	 */
	public async onRoomFormed(
		event: DomainEvent<DomainRoomFormedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:formed",
			data: {
				roomId: event.payload.roomId.value(),
			},
		} satisfies { event: string; data: RoomFormedPayload });
	}

	/**
	 * @description
	 * Forwarded as `room:participant-joined`.
	 */
	public async onParticipantJoined(
		event: DomainEvent<ParticipantInvitedPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:participant-joined",
			data: {
				roomId: event.payload.roomId.value(),
				participantId: event.payload.participantId.value(),
				model: event.payload.model,
				name: event.payload.name,
				provider: event.payload.provider,
				qualifiedModel: event.payload.qualifiedModel,
			},
		} satisfies { event: string; data: RoomParticipantJoinedPayload });
	}

	/**
	 * @description
	 * Forwarded as `room:turn-registered`.
	 */
	public async onTurnRegistered(
		event: DomainEvent<TurnRegisteredPayload>,
	): Promise<void> {
		if (!event.payload) return;
		await this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:turn-registered",
			data: {
				roomId: event.payload.roomId.value(),
				turnId: event.payload.turnId.value(),
			},
		} satisfies { event: string; data: RoomTurnRegisteredPayload });
	}
}
