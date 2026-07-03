import {
	CheckpointGenerated,
	CheckpointInitiated,
	DeliberationConcluded,
	DeliberationStarted,
	RoomFrozen,
	type RoomFrozenPayload,
	RoomLocked,
	RoomTopicGenerated,
	type RoomTopicGeneratedPayload,
	RoomUnfrozen,
	RoomUnlocked,
	TurnAbandoned,
	TurnFailed,
	type TurnFailedPayload,
	TurnInitiated,
	TurnRetried,
	TurnSettled,
	type TurnSettledPayload,
	TurnSlotClaimed,
	TurnSlotReleased,
	TurnStreamStarted,
	TurnTokenAccumulated,
} from "@briom/core/domain";
import type { IEventSubscriberRegistry } from "@briom/libs/drimion/types/event.types";
import type { DomainEvent, EventSubscriber } from "@drimion";
import { after } from "next/server";

import type { AnalyticsEvent } from "../ports/analytics/analytics.event";
import type { IAnalyticsTracker } from "../ports/analytics/analytics.tracker";

/**
 * @description
 * A per-event-type translator: knows how to turn one specific domain
 * event's payload into an AnalyticsEvent, or `null` if this particular
 * occurrence isn't worth forwarding.
 */
type AnalyticsTranslator<TPayload> = (
	event: DomainEvent<TPayload>,
) => AnalyticsEvent | null;

/**
 * @description
 * Translates a curated allow-list of domain events into product-analytics
 * events and forwards them via IAnalyticsTracker. Registered against the
 * IEventBus at composition root — domain and application layers never
 * know this subscriber exists.
 *
 * Each translation is scheduled via `after()` rather than awaited, so a
 * slow or failing analytics provider never adds latency to the request
 * that triggered the underlying domain event.
 */
export class AnalyticsEventSubscriber {
	public constructor(private readonly tracker: IAnalyticsTracker) {}

	private registry = {
		topicGenerated: RoomTopicGenerated.type,

		checkpoint: {
			initiated: CheckpointInitiated.type,
			generated: CheckpointGenerated.type,
		},

		deliberation: {
			started: DeliberationStarted.type,
			concluded: DeliberationConcluded.type,
		},

		room: {
			frozen: RoomFrozen.type,
			unfrozen: RoomUnfrozen.type,
			locked: RoomLocked.type,
			unlocked: RoomUnlocked.type,
		},

		turnSlot: {
			claimed: TurnSlotClaimed.type,
			released: TurnSlotReleased.type,
		},

		turns: {
			abandoned: TurnAbandoned.type,
			failed: TurnFailed.type,
			initiated: TurnInitiated.type,
			retried: TurnRetried.type,
			settled: TurnSettled.type,
			streamStarted: TurnStreamStarted.type,
			tokenAccumulated: TurnTokenAccumulated.type,
		},
	} as const;

	/**
	 * @description
	 * Registers every translator this subscriber knows about against the
	 * event bus. Call once at composition root, before any command that
	 * might publish these event types runs.
	 */
	public register(eventBus: IEventSubscriberRegistry): void {
		const {
			topicGenerated,
			room: { frozen },
			turns: { settled, failed },
		} = this.registry;

		eventBus.subscribe(topicGenerated, this.forward(this.onTopicGenerated));
		eventBus.subscribe(frozen, this.forward(this.onRoomFrozen));
		eventBus.subscribe(settled, this.forward(this.onTurnSettled));
		eventBus.subscribe(failed, this.forward(this.onTurnFailed));
	}

	/**
	 * @description
	 * Wraps a translator into the EventSubscriber shape IEventBus expects,
	 * handling the "translate, then schedule, don't await" plumbing once
	 * so each translator below only has to care about mapping payload
	 * fields — not scheduling mechanics.
	 */
	private forward<TPayload>(
		translate: AnalyticsTranslator<TPayload>,
	): EventSubscriber<TPayload> {
		return (event) => {
			const analyticsEvent = translate(event);
			if (!analyticsEvent) return;

			after(() => this.tracker.track(analyticsEvent));
		};
	}

	/**
	 * @description
	 * Typed against the base Room payload only — if RoomTopicGenerated
	 * carries extra fields (the topic text itself, etc.), widen this
	 * translator's generic to that specific payload type once it exists,
	 * to pull in properties worth tracking beyond the base shape.
	 */
	private onTopicGenerated: AnalyticsTranslator<RoomTopicGeneratedPayload> = (
		event,
	) => {
		if (!event.payload) return null;

		return {
			name: this.registry.topicGenerated,
			distinctId: event.payload.moderatorId.value(),
			properties: { roomId: event.payload.roomId.value() },
			occurredAt: event.occurredAt,
		};
	};

	/**
	 * @description
	 * The business-critical conversion moment: insufficient credit →
	 * frozen. Typed against the base payload for now — if RoomFrozen
	 * ends up carrying a `reason` field, add it to properties once that
	 * type exists.
	 */
	private onRoomFrozen: AnalyticsTranslator<RoomFrozenPayload> = (event) => {
		if (!event.payload) return null;

		return {
			name: this.registry.room.frozen,
			distinctId: event.payload.moderatorId.value(),
			properties: { roomId: event.payload.roomId.value() },
			occurredAt: event.occurredAt,
		};
	};

	/**
	 * @description
	 * Turn-level — attributed by roomId, not moderatorId, since Turn
	 * doesn't carry moderator identity by design (see class doc).
	 */
	private onTurnSettled: AnalyticsTranslator<TurnSettledPayload> = (event) => {
		if (!event.payload) return null;

		return {
			name: this.registry.turns.settled,
			distinctId: event.payload.roomId.value(),
			properties: { turnId: event.payload.turnId.value() },
			occurredAt: event.occurredAt,
		};
	};

	/**
	 * @description
	 * Same attribution reasoning as onTurnSettled.
	 */
	private onTurnFailed: AnalyticsTranslator<TurnFailedPayload> = (event) => {
		if (!event.payload) return null;

		return {
			name: this.registry.turns.failed,
			distinctId: event.payload.roomId.value(),
			properties: { turnId: event.payload.turnId.value() },
			occurredAt: event.occurredAt,
		};
	};
}
