/**
 * @ignore
 * biome-ignore-all lint/correctness/noUnusedPrivateClassMembers: ignore.
 * Future-enablement: Some events are currently being turned off (unused).
 */
import {
	type BaseTurnEventPayload,
	type IRoomRepository,
	TurnAbandoned,
	type TurnAbandonedPayload,
	TurnFailed,
	type TurnFailedPayload,
	TurnInitiated,
	type TurnInitiatedPayload,
	TurnRetried,
	TurnSettled,
	type TurnSettledPayload,
	TurnStreamStarted,
	type TurnStreamStartedPayload,
	TurnTokenAccumulated,
} from "@briom/domain";
import type {
	DomainEvent,
	IEventSubscriberRegistry,
} from "@briom/libs/drimion/types/event.types";
import { after } from "next/server";

import type { IRealtimeBroadcaster } from "../ports";

interface RealtimeSignal {
	data: Record<string, unknown>;
	event: string;
}

type RealtimeTranslator<TPayload> = (
	event: DomainEvent<TPayload>,
) => RealtimeSignal | null;

/**
 * @description
 * Forwards Turn terminal-state events (settled, failed) to Supabase
 * Realtime. Deliberately narrow — `turn:stream-started` and, above all,
 * `turn:token-accumulated` are NEVER forwarded here. Per-token content
 * lives entirely on the Streaming plane (Inngest execution → throttled
 * write to `turns.content` → FE polling via `TurnStreamProjection`).
 * Realtime only carries the two moments FE needs to react to instantly:
 * a turn reached SETTLED or FAILED, so it can stop polling.
 *
 * Turn aggregates don't carry `moderatorId` by design (see Turn's class
 * doc) — this subscriber resolves it via a Room lookup before picking
 * the `moderator:{id}` channel to broadcast on.
 */
export class TurnsEventSubscriber {
	public constructor(
		private readonly broadcaster: IRealtimeBroadcaster,
		private readonly roomRepository: IRoomRepository,
	) {}

	private registry = {
		/**
		 * @description
		 * FE needs this: remove failed turn (immediately) from turn sequences.
		 */
		abandoned: TurnAbandoned.type,
		/**
		 * @description
		 * FE needs this: automatically render failed turn component.
		 */
		failed: TurnFailed.type,
		/**
		 * @description
		 * FE needs this–but only interested in participant turn.
		 */
		initiated: TurnInitiated.type,
		/**
		 * @description
		 * FE does not need this yet.
		 */
		retried: TurnRetried.type,
		/**
		 * @description
		 * FE needs this: (re-)invalidate query cache.
		 */
		settled: TurnSettled.type,
		/**
		 * @description
		 * FE needs this: signal to start polling.
		 */
		streamStarted: TurnStreamStarted.type,
		/**
		 * @description
		 * FE does not need this yet.
		 *
		 * Streaming happens in a background process.
		 * FE would prefer a polling to get the projection per-n ms.
		 */
		tokenAccumulated: TurnTokenAccumulated.type,
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
	 * Wraps a translator into the EventSubscriber shape IEventBus expects.
	 * Unlike RoomsEventSubscriber, this must resolve `moderatorId` async
	 * via the Room before it knows which channel to broadcast on — so the
	 * repository lookup happens inside `after()` too, never blocking the
	 * request that triggered the underlying domain event.
	 */
	private forward<TPayload extends BaseTurnEventPayload>(
		translate: RealtimeTranslator<TPayload>,
	) {
		return (event: DomainEvent<TPayload>) => {
			if (!event.payload) return;
			const signal = translate(event);
			if (!signal) return;

			const { roomId } = event.payload;

			after(async () => {
				const room = await this.roomRepository.findById(roomId);
				if (!room) return;

				const moderatorId = room.get("moderatorId").value();
				await this.broadcaster.broadcast(
					`moderator:${moderatorId}`,
					signal.event,
					signal.data,
				);
			});
		};
	}

	// ===================================================================
	// Broadcaster
	// ===================================================================

	private onTurnAbandoned: RealtimeTranslator<TurnAbandonedPayload> = (
		event,
	) => {
		if (!event.payload) return null;
		const { roomId, turnId } = event.payload;

		return {
			event: this.registry.failed,
			data: { roomId: roomId.value(), turnId: turnId.value() },
		};
	};

	private onTurnFailed: RealtimeTranslator<TurnFailedPayload> = (event) => {
		if (!event.payload) return null;
		const { roomId, turnId, error } = event.payload;

		return {
			event: this.registry.failed,
			data: {
				roomId: roomId.value(),
				turnId: turnId.value(),
				errorKind: error.kind,
			},
		};
	};

	private onTurnInitiated: RealtimeTranslator<TurnInitiatedPayload> = (
		event,
	) => {
		if (!event.payload) return null;
		const { roomId, turnId, authorType, sequence } = event.payload;

		if (authorType === "moderator") return null;

		return {
			event: this.registry.failed,
			data: {
				roomId: roomId.value(),
				turnId: turnId.value(),
				sequence: sequence.get("value"),
			},
		};
	};

	private onTurnSettled: RealtimeTranslator<TurnSettledPayload> = (event) => {
		if (!event.payload) return null;
		const { roomId, turnId } = event.payload;

		return {
			event: this.registry.settled,
			data: { roomId: roomId.value(), turnId: turnId.value() },
		};
	};

	private onStreamStarted: RealtimeTranslator<TurnStreamStartedPayload> = (
		event,
	) => {
		if (!event.payload) return null;
		const { roomId, turnId } = event.payload;

		return {
			event: this.registry.failed,
			data: { roomId: roomId.value(), turnId: turnId.value() },
		};
	};
}
