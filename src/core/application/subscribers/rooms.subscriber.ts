/**
 * @ignore
 * biome-ignore-all lint/correctness/noUnusedPrivateClassMembers: ignore.
 * Future-enablement: Some events are currently being turned off (unused).
 */
import {
	type BaseRoomDomainEventPayload,
	CheckpointGenerated,
	type CheckpointGeneratedPayload,
	CheckpointInitiated,
	type CheckpointInitiatedPayload,
	DeliberationConcluded,
	DeliberationStarted,
	RoomFrozen,
	type RoomFrozenPayload,
	RoomLocked,
	type RoomLockedPayload,
	RoomTopicGenerated,
	type RoomTopicGeneratedPayload,
	RoomUnfrozen,
	RoomUnlocked,
	TurnSlotClaimed,
	type TurnSlotClaimedPayload,
	TurnSlotReleased,
	type TurnSlotReleasedPayload,
} from "@briom/domain";
import type {
	DomainEvent,
	IEventSubscriberRegistry,
} from "@briom/libs/drimion/types/event.types";
import { after } from "next/server";

import type { IRealtimeBroadcaster } from "../ports";

/**
 * @description
 * A signal a translator emits — `moderatorId` picks the channel
 * (`moderator:{id}`), `event`/`data` become the Realtime payload.
 */
interface RealtimeSignal {
	data: Record<string, unknown>;
	event: string;
	moderatorId: string;
}

type RealtimeTranslator<TPayload> = (
	event: DomainEvent<TPayload>,
) => RealtimeSignal | null;

/**
 * @description
 * Forwards a curated allow-list of coarse, low-frequency Room lifecycle
 * events to Supabase Realtime. This is the ONLY consumer of Realtime in
 * Briom — anything per-token or high-frequency stays on the Streaming
 * plane instead, to protect the free-tier quota (200 concurrent
 * connections, 2M messages/month).
 *
 * Channel is scoped per-moderator (`moderator:{moderatorId}`), not
 * per-room — a moderator with several rooms open keeps a single
 * Realtime connection; FE filters by `roomId` inside the payload.
 */
export class RoomsEventSubscriber {
	public constructor(private readonly broadcaster: IRealtimeBroadcaster) {}

	private registry = {
		/**
		 * @description
		 * FE needs this: run typewriter effect automatically.
		 */
		topicGenerated: RoomTopicGenerated.type,

		checkpoint: {
			/**
			 * @description
			 * FE does not need this yet.
			 */
			initiated: CheckpointInitiated.type,

			/**
			 * @description
			 * FE does not need this yet.
			 */
			generated: CheckpointGenerated.type,
		},

		deliberation: {
			/**
			 * @description
			 * FE needs this: hide invite participant button, change room's menu actions,
			 * update query cache for this room's status, etc.
			 */
			started: DeliberationStarted.type,

			/**
			 * @description
			 * FE needs this: make the page read-only.
			 * e.g.: disables moderator input, hides proposal, hides retry buttons, etc.
			 */
			concluded: DeliberationConcluded.type,
		},

		room: {
			/**
			 * @description
			 * FE needs this: render a frozen-notice banner.
			 * Also, inherits some of `onDeliberationConcluded` UI events.
			 */
			frozen: RoomFrozen.type,

			/**
			 * @description
			 * FE needs this: remove the frozen-notice banner.
			 * Might as well enable functionality on the room.
			 */
			unfrozen: RoomUnfrozen.type,

			/**
			 * @description
			 * FE needs this: similar behavior with `onRoomFrozen`–but different message.
			 */
			locked: RoomLocked.type,

			/**
			 * @description
			 * FE needs this: same behavior with `onRoomUnfrozen` traits.
			 */
			unlocked: RoomUnlocked.type,
		},

		turnSlot: {
			/**
			 * @description
			 * FE needs this: disable input, hide proposals (& retry button), etc.
			 */
			claimed: TurnSlotClaimed.type,

			/**
			 * @description
			 * FE needs this: enable input, show proposals (& retry button), etc.
			 */
			released: TurnSlotReleased.type,
		},
	};

	public register(eventBus: IEventSubscriberRegistry): void {
		const {
			topicGenerated,
			deliberation: { started, concluded },
			room: { frozen, unfrozen, locked, unlocked },
			turnSlot: { claimed, released },
		} = this.registry;

		eventBus.subscribe(topicGenerated, this.forward(this.onTopicGenerated));
		eventBus.subscribe(started, this.forward(this.onDeliberationStarted));
		eventBus.subscribe(concluded, this.forward(this.onDeliberationConcluded));
		eventBus.subscribe(frozen, this.forward(this.onRoomFrozen));
		eventBus.subscribe(unfrozen, this.forward(this.onRoomUnfrozen));
		eventBus.subscribe(locked, this.forward(this.onRoomLocked));
		eventBus.subscribe(unlocked, this.forward(this.onRoomUnlocked));
		eventBus.subscribe(claimed, this.forward(this.onTurnSlotClaimed));
		eventBus.subscribe(released, this.forward(this.onTurnSlotReleased));
	}

	/**
	 * @description
	 * Wraps a translator into the EventSubscriber shape IEventBus expects.
	 * Synchronous by design — Room payloads already carry `moderatorId`,
	 * so no repository lookup is needed before scheduling the broadcast.
	 */
	private forward<TPayload>(translate: RealtimeTranslator<TPayload>) {
		return (event: DomainEvent<TPayload>) => {
			const signal = translate(event);
			if (!signal) return;

			after(() =>
				this.broadcaster.broadcast(
					`moderator:${signal.moderatorId}`,
					signal.event,
					signal.data,
				),
			);
		};
	}

	// ===================================================================
	// Broadcaster
	// ===================================================================

	private onTopicGenerated: RealtimeTranslator<RoomTopicGeneratedPayload> = (
		event,
	) => {
		if (!event.payload) return null;
		const { moderatorId, roomId, topic } = event.payload;

		return {
			moderatorId: moderatorId.value(),
			event: this.registry.topicGenerated,
			data: { roomId: roomId.value(), topic: topic },
		};
	};

	private onCheckpointInitiated: RealtimeTranslator<CheckpointInitiatedPayload> =
		(event) => {
			if (!event.payload) return null;
			const { moderatorId, roomId, checkpointId } = event.payload;

			return {
				moderatorId: moderatorId.value(),
				event: "room:checkpoint-initiated",
				data: { roomId: roomId.value(), checkpointId: checkpointId.value() },
			};
		};

	private onCheckpointGenerated: RealtimeTranslator<CheckpointGeneratedPayload> =
		(event) => {
			if (!event.payload) return null;
			const { moderatorId, roomId, checkpointId } = event.payload;

			return {
				moderatorId: moderatorId.value(),
				event: "room:checkpoint-generated",
				data: { roomId: roomId.value(), checkpointId: checkpointId.value() },
			};
		};

	private onDeliberationStarted: RealtimeTranslator<BaseRoomDomainEventPayload> =
		(event) => {
			if (!event.payload) return null;
			const { moderatorId, roomId } = event.payload;

			return {
				moderatorId: moderatorId.value(),
				event: "room:deliberation-started",
				data: { roomId: roomId.value() },
			};
		};

	private onDeliberationConcluded: RealtimeTranslator<BaseRoomDomainEventPayload> =
		(event) => {
			if (!event.payload) return null;
			const { moderatorId, roomId } = event.payload;

			return {
				moderatorId: moderatorId.value(),
				event: "room:deliberation-concluded",
				data: { roomId: roomId.value() },
			};
		};

	private onRoomFrozen: RealtimeTranslator<RoomFrozenPayload> = (event) => {
		if (!event.payload) return null;
		const { moderatorId, roomId, reason } = event.payload;

		return {
			moderatorId: moderatorId.value(),
			event: this.registry.room.frozen,
			data: { roomId: roomId.value(), reason },
		};
	};

	private onRoomUnfrozen: RealtimeTranslator<BaseRoomDomainEventPayload> = (
		event,
	) => {
		if (!event.payload) return null;
		const { moderatorId, roomId } = event.payload;

		return {
			moderatorId: moderatorId.value(),
			event: this.registry.room.unfrozen,
			data: { roomId: roomId.value() },
		};
	};

	private onRoomLocked: RealtimeTranslator<RoomLockedPayload> = (event) => {
		if (!event.payload) return null;
		const { moderatorId, roomId, reason } = event.payload;

		return {
			moderatorId: moderatorId.value(),
			event: this.registry.room.locked,
			data: { roomId: roomId.value(), reason },
		};
	};

	private onRoomUnlocked: RealtimeTranslator<RoomLockedPayload> = (event) => {
		if (!event.payload) return null;
		const { moderatorId, roomId } = event.payload;

		return {
			moderatorId: moderatorId.value(),
			event: this.registry.room.unlocked,
			data: { roomId: roomId.value() },
		};
	};

	private onTurnSlotClaimed: RealtimeTranslator<TurnSlotClaimedPayload> = (
		event,
	) => {
		if (!event.payload) return null;
		const { moderatorId, roomId, turnId } = event.payload;

		return {
			moderatorId: moderatorId.value(),
			event: this.registry.turnSlot.claimed,
			data: { roomId: roomId.value(), turnId: turnId.value() },
		};
	};

	private onTurnSlotReleased: RealtimeTranslator<TurnSlotReleasedPayload> = (
		event,
	) => {
		if (!event.payload) return null;
		const { moderatorId, roomId } = event.payload;

		return {
			moderatorId: moderatorId.value(),
			event: this.registry.turnSlot.released,
			data: { roomId: roomId.value() },
		};
	};
}
