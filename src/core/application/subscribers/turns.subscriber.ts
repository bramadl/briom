import {
	type BaseTurnEventPayload,
	TurnAbandoned,
	type TurnAbandonedPayload,
	TurnFailed,
	type TurnFailedPayload,
	TurnInitiated,
	type TurnInitiatedPayload,
	TurnSettled,
	type TurnSettledPayload,
	TurnStreamStarted,
	type TurnStreamStartedPayload,
} from "@briom/core/domain";
import type {
	DomainEvent,
	IEventSubscriberRegistry,
} from "@briom/libs/drimion/types/event.types";
import { after } from "next/server";

import type { ITurnRealtimePublisher } from "../ports/publishers/turn-realtime.publisher";

/**
 * @description
 * Forwards Turn lifecycle events to Inngest Realtime, one publish per
 * event on the `turn:{roomId}` channel (see `turnChannel`). Every
 * event here carries `roomId` directly in its own payload, so — unlike
 * the old Supabase-backed version of this subscriber — there is no
 * Room lookup needed to resolve which channel to publish on. This also
 * means the `after()` callback below never awaits I/O beyond the
 * publish itself, so subscriber registration no longer needs
 * `IRoomRepository` as a dependency at all.
 *
 * `TurnRetried` and `TurnTokenAccumulated` are NOT subscribed here.
 * `TurnRetried` — FE doesn't need it yet (unchanged from before).
 * `TurnTokenAccumulated` is deliberately absent from this event-bus
 * path too: it's published directly from `StreamConsumer.consume()`
 * instead, at the same cadence as its DB flush, rather than being
 * pulled through a domain event round-trip. Routing it through here
 * would mean firing a domain event per flush just to immediately
 * forward it — `StreamConsumer` already has the throttled buffer and
 * the publisher in hand, so it publishes directly.
 */
export class TurnsEventSubscriber {
	public constructor(private readonly publisher: ITurnRealtimePublisher) {}

	private registry = {
		abandoned: TurnAbandoned.type,
		failed: TurnFailed.type,
		initiated: TurnInitiated.type,
		settled: TurnSettled.type,
		streamStarted: TurnStreamStarted.type,
	};

	public register(eventBus: IEventSubscriberRegistry): void {
		const { abandoned, failed, initiated, settled, streamStarted } =
			this.registry;

		eventBus.subscribe(abandoned, this.forward(this.onTurnAbandoned));
		eventBus.subscribe(failed, this.forward(this.onTurnFailed));
		eventBus.subscribe(initiated, this.forward(this.onTurnInitiated));
		eventBus.subscribe(settled, this.forward(this.onTurnSettled));
		eventBus.subscribe(streamStarted, this.forward(this.onStreamStarted));
	}

	/**
	 * @description
	 * Wraps a translator into the EventSubscriber shape IEventBus
	 * expects. The publish happens inside `after()` so it never blocks
	 * the request that triggered the underlying domain event — but
	 * unlike the old version, nothing here needs to `await` a
	 * repository lookup first.
	 */
	private forward<TPayload extends BaseTurnEventPayload>(
		translate: (event: DomainEvent<TPayload>) => (() => Promise<void>) | null,
	) {
		return (event: DomainEvent<TPayload>) => {
			if (!event.payload) return;
			const publish = translate(event);
			if (!publish) return;

			after(publish);
		};
	}

	// ===================================================================
	// Publisher
	// ===================================================================

	private onTurnAbandoned = (event: DomainEvent<TurnAbandonedPayload>) => {
		if (!event.payload) return null;
		const { roomId, turnId } = event.payload;

		return () =>
			this.publisher.publishAbandoned(roomId.value(), {
				turnId: turnId.value(),
			});
	};

	private onTurnFailed = (event: DomainEvent<TurnFailedPayload>) => {
		if (!event.payload) return null;
		const { roomId, turnId, error } = event.payload;

		return () =>
			this.publisher.publishFailed(roomId.value(), {
				turnId: turnId.value(),
				errorKind: error.kind,
			});
	};

	private onTurnInitiated = (event: DomainEvent<TurnInitiatedPayload>) => {
		if (!event.payload) return null;
		const { roomId, turnId, authorType, sequence } = event.payload;

		if (authorType === "moderator") return null;

		return () =>
			this.publisher.publishInitiated(roomId.value(), {
				turnId: turnId.value(),
				sequence: sequence.get("value"),
			});
	};

	private onTurnSettled = (event: DomainEvent<TurnSettledPayload>) => {
		if (!event.payload) return null;
		const { roomId, turnId } = event.payload;

		return () =>
			this.publisher.publishSettled(roomId.value(), {
				turnId: turnId.value(),
			});
	};

	private onStreamStarted = (event: DomainEvent<TurnStreamStartedPayload>) => {
		if (!event.payload) return null;
		const { roomId, turnId } = event.payload;

		return () =>
			this.publisher.publishStreamStarted(roomId.value(), {
				turnId: turnId.value(),
			});
	};
}
