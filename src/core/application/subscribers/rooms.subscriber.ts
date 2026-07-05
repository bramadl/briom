/**
 * @ignore
 * biome-ignore-all lint/correctness/noUnusedPrivateClassMembers: ignore.
 * Future-enablement: Some events are currently being turned off (unused).
 */
import {
	CheckpointGenerated,
	type CheckpointGeneratedPayload,
	CheckpointInitiated,
	type CheckpointInitiatedPayload,
	DeliberationConcluded,
	type DeliberationConcludedPayload,
	DeliberationStarted,
	type DeliberationStartedPayload,
	RoomFrozen,
	type RoomFrozenPayload,
	RoomLocked,
	type RoomLockedPayload,
	RoomTopicGenerated,
	type RoomTopicGeneratedPayload,
	RoomUnfrozen,
	type RoomUnfrozenPayload,
	RoomUnlocked,
	type RoomUnlockedPayload,
	TurnSlotClaimed,
	type TurnSlotClaimedPayload,
	TurnSlotReleased,
	type TurnSlotReleasedPayload,
} from "@briom/core/domain";
import type {
	DomainEvent,
	IEventSubscriberRegistry,
} from "@briom/libs/drimion/types/event.types";
import { after } from "next/server";

import type { IRoomRealtimePublisher } from "../ports/publishers/room-realtime.publisher";

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
	public constructor(private readonly publisher: IRoomRealtimePublisher) {}

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

			// all turns are in the following format: `room:{entity}`.
			const [scope, entity] = signal.event.split(":");

			after(() =>
				this.publisher.broadcast(
					`${scope}:${signal.moderatorId}:${entity}`,
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
				event: this.registry.checkpoint.initiated,
				data: { roomId: roomId.value(), checkpointId: checkpointId.value() },
			};
		};

	private onCheckpointGenerated: RealtimeTranslator<CheckpointGeneratedPayload> =
		(event) => {
			if (!event.payload) return null;
			const { moderatorId, roomId, checkpointId } = event.payload;

			return {
				moderatorId: moderatorId.value(),
				event: this.registry.checkpoint.generated,
				data: { roomId: roomId.value(), checkpointId: checkpointId.value() },
			};
		};

	private onDeliberationStarted: RealtimeTranslator<DeliberationStartedPayload> =
		(event) => {
			if (!event.payload) return null;
			const { moderatorId, roomId } = event.payload;

			return {
				moderatorId: moderatorId.value(),
				event: this.registry.deliberation.started,
				data: { roomId: roomId.value() },
			};
		};

	private onDeliberationConcluded: RealtimeTranslator<DeliberationConcludedPayload> =
		(event) => {
			if (!event.payload) return null;
			const { moderatorId, roomId } = event.payload;

			return {
				moderatorId: moderatorId.value(),
				event: this.registry.deliberation.concluded,
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

	private onRoomUnfrozen: RealtimeTranslator<RoomUnfrozenPayload> = (event) => {
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

	private onRoomUnlocked: RealtimeTranslator<RoomUnlockedPayload> = (event) => {
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
