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
	EventSubscriber,
	IEventSubscriberRegistry,
} from "@briom/libs/drimion/types/event.types";

import type { ILogger } from "../ports/logger/logger";
import type { ITurnRealtimePublisher } from "../ports/publishers/turn-realtime.publisher";

/**
 * @description
 * Forwards Turn lifecycle events to Inngest Realtime, one publish per
 * event on the `turn:{roomId}` channel (see `turnChannel`).
 *
 * Deliberately does NOT use `next/server`'s `after()`. This subscriber
 * fires from two different execution contexts:
 *   1. `InitiateTurnHandler`, inside a genuine Next.js Server Action
 *      request (browser → server).
 *   2. `StreamTurnHandler`, inside an Inngest worker's call to
 *      `/api/workers` — NOT a Next.js Server Action/Route Handler
 *      request, even though it happens to be an HTTP request Next.js
 *      is technically handling.
 *
 * `after()` is only valid in the first context. In the second, it
 * silently drops the scheduled callback — confirmed by Inngest's own
 * realtime server logs, which showed the two Inngest event triggers
 * (`topic/generation.requested`, `turn/generation.requested`) firing
 * correctly, but never a single `turn:{roomId}:settled` (or
 * `streamStarted`/`failed`) publish, even though `StreamTurnHandler`
 * logged a fully successful execution all the way through.
 *
 * Publishing directly (awaited, with its own try/catch) works
 * correctly in both contexts and is not meaningfully slower — the
 * publish itself is a single WebSocket fan-out message, not blocking
 * I/O worth deferring.
 */
export class TurnsEventSubscriber {
	public constructor(
		private readonly publisher: ITurnRealtimePublisher,
		private readonly logger: ILogger,
	) {}

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
	 * Wraps a translator into the `EventSubscriber` shape `IEventBus`
	 * expects. Returns an `async` function so it satisfies
	 * `void | Promise<void>` regardless of whether the concrete
	 * `IEventBus` implementation awaits subscribers or not — either way,
	 * the publish itself always actually runs, unlike the previous
	 * `after()`-based version.
	 */
	private forward<TPayload extends BaseTurnEventPayload>(
		translate: (event: DomainEvent<TPayload>) => (() => Promise<void>) | null,
	): EventSubscriber<TPayload> {
		return async (event: DomainEvent<TPayload>): Promise<void> => {
			if (!event.payload) return;
			const publish = translate(event);
			if (!publish) return;

			try {
				await publish();
			} catch (error) {
				this.logger.error("TurnsEventSubscriber: publish to realtime failed", {
					eventType: event.type,
					errorName: error instanceof Error ? error.name : typeof error,
					errorMessage: error instanceof Error ? error.message : String(error),
				});
			}
		};
	}

	// ===================================================================
	// Translators
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
				kind: error.kind,
				message: error.message,
				isRetryable: error.isRetryable,
				retryAfter: error.retryAfter,
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
		const { roomId, turnId, content } = event.payload;

		return () =>
			this.publisher.publishSettled(roomId.value(), {
				turnId: turnId.value(),
				content,
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
