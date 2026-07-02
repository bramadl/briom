import type {
	BaseRoomDomainEventPayload,
	BaseTurnEventPayload,
} from "@briom/domain";
import type { DomainEvent, EventSubscriber } from "@briom/libs/drimion";
import type { IEventSubscriberRegistry } from "@briom/libs/drimion/types/event.types";
import { after } from "next/server";

import type { AnalyticsEvent, IAnalyticsTracker } from "../ports/analytics";

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

	/**
	 * @description
	 * Registers every translator this subscriber knows about against the
	 * event bus. Call once at composition root, before any command that
	 * might publish these event types runs.
	 */
	public register(eventBus: IEventSubscriberRegistry): void {
		eventBus.subscribe(
			"room:topic-generated",
			this.forward(this.translateRoomTopicGenerated),
		);

		eventBus.subscribe("room:frozen", this.forward(this.translateRoomFrozen));
		eventBus.subscribe("turn:settled", this.forward(this.translateTurnSettled));
		eventBus.subscribe("turn:failed", this.forward(this.translateTurnFailed));
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
	private translateRoomTopicGenerated: AnalyticsTranslator<BaseRoomDomainEventPayload> =
		(event) => {
			if (!event.payload) return null;

			return {
				name: "room_topic_generated",
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
	private translateRoomFrozen: AnalyticsTranslator<BaseRoomDomainEventPayload> =
		(event) => {
			if (!event.payload) return null;

			return {
				name: "room_frozen",
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
	private translateTurnSettled: AnalyticsTranslator<BaseTurnEventPayload> = (
		event,
	) => {
		if (!event.payload) return null;

		return {
			name: "turn_settled",
			distinctId: event.payload.roomId.value(),
			properties: { turnId: event.payload.turnId.value() },
			occurredAt: event.occurredAt,
		};
	};

	/**
	 * @description Same attribution reasoning as translateTurnSettled.
	 */
	private translateTurnFailed: AnalyticsTranslator<BaseTurnEventPayload> = (
		event,
	) => {
		if (!event.payload) return null;

		return {
			name: "turn_failed",
			distinctId: event.payload.roomId.value(),
			properties: { turnId: event.payload.turnId.value() },
			occurredAt: event.occurredAt,
		};
	};
}
