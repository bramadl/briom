/**
 * @file event-handlers.ts
 * @path src/app/(rooms)/_/room/sse/event-handlers.ts
 *
 * ## Streaming Optimization
 *
 * **Before:** Every `turn:token` called `bufferToken()` which accumulated into
 * `patchDeliberation()` → `setQueryData()` on the full `RoomDeliberation` object.
 * Even with RAF batching, this still triggered React Query re-renders across
 * the entire query consumer tree (useRoom → TurnSequence → all N TurnCards).
 *
 * **After:** `turn:token` writes exclusively to `useTurnStreamStore` (Zustand).
 * No query cache mutation. No React re-render from the query layer.
 * Only the `ParticipantTurn` subscribed to its own `turnId` re-renders.
 *
 * The `token-buffers.ts` module is no longer needed for token handling.
 * It can be kept for backward compatibility or deleted.
 *
 * ## Event Routing
 *
 * | Event                       | Stream Store | Query Cache |
 * |-----------------------------|:---:|:---:|
 * | turn:initiated              | ✓   | ✓   |
 * | turn:started                | ✓   | ✓   |
 * | turn:token                  | ✓   | ✗   |  ← KEY CHANGE
 * | turn:settled                | ✓   | ✓   |  ← cache update once
 * | turn:failed                 | ✓   | ✓   |
 * | room:* events               | ✗   | ✓   |
 */

import type {
	RoomDeliberationConcludedPayload,
	RoomDeliberationStartedPayload,
	RoomDeliberationTurnDTO,
	RoomParticipantJoinedPayload,
	TurnFailedPayload,
	TurnInitiatedPayload,
	TurnSettledPayload,
	TurnStreamStartedPayload,
	TurnTokenPayload,
} from "@briom/app";
import type { QueryClient } from "@tanstack/react-query";

import type { RoomEventName } from "./event-names";
import { patchDeliberation } from "./helpers/query-patchers";
import { useTurnStreamStore } from "./store/turn-stream.store";

// ─── Handler types ────────────────────────────────────────────────────────────

type SseEventContext<TPayload = unknown> = {
	data: TPayload;
	queryClient: QueryClient;
	roomId: string;
};

type SseEventHandler<TPayload = unknown> = (
	ctx: SseEventContext<TPayload>,
) => void;

interface RoomEventPayloadMap {
	"room:deliberation-concluded": RoomDeliberationConcludedPayload;
	"room:deliberation-paused": unknown;
	"room:deliberation-resumed": unknown;
	"room:deliberation-started": RoomDeliberationStartedPayload;
	"room:formed": unknown;
	"room:participant-joined": RoomParticipantJoinedPayload;
	"room:turn-registered": unknown;
	"turn:failed": TurnFailedPayload;
	"turn:initiated": TurnInitiatedPayload;
	"turn:settled": TurnSettledPayload;
	"turn:started": TurnStreamStartedPayload;
	"turn:token": TurnTokenPayload;
}

// ─── Individual handlers ──────────────────────────────────────────────────────

function noopHandler(_: SseEventContext): void {}

function deliberationConcludedHandler({
	queryClient,
	roomId,
}: SseEventContext<RoomDeliberationConcludedPayload>): void {
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		status: "concluded",
	}));
}

function deliberationStartedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<RoomDeliberationStartedPayload>): void {
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		topic: data.topic,
		status: "deliberating",
	}));
}

function participantJoinedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<RoomParticipantJoinedPayload>): void {
	patchDeliberation(queryClient, roomId, (room) => {
		if (room.participants.some((p) => p.id === data.participantId)) return room;
		return {
			...room,
			participants: [
				...room.participants,
				{
					id: data.participantId,
					model: data.model,
					name: data.name,
				},
			],
		};
	});
}

function turnInitiatedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnInitiatedPayload>): void {
	// 1. Register in stream store (real-time rendering source during streaming)
	useTurnStreamStore.getState().initTurn({
		id: data.turnId,
		authorType: data.authorType,
		participantId: data.participantId,
		roomId,
		sequence: data.sequence,
	});

	// 2. Also patch query cache so the turn appears in the turn list structure
	//    (needed for TurnSequence to know which turn IDs to render)
	const optimisticId = data.clientTurnId
		? `optimistic-${data.clientTurnId}`
		: null;

	patchDeliberation(queryClient, roomId, (room) => {
		const existingIndex = room.turns.findIndex((t) => t.id === data.turnId);

		if (existingIndex !== -1) {
			const existing = room.turns[existingIndex];
			if (existing.status === "pending") return room;

			const next = [...room.turns];
			next[existingIndex] = {
				...existing,
				status: "pending",
				content: "",
				error: null,
			};
			return { ...room, turns: next };
		}

		const participant = room.participants.find(
			(p) => p.id === data.participantId,
		);

		const profile =
			data.authorType === "participant"
				? participant
					? {
							id: participant.id,
							displayName: participant.name,
							model: participant.model,
						}
					: null
				: null;

		const newTurn: RoomDeliberationTurnDTO = {
			id: data.turnId,
			author: {
				type: data.authorType,
				profile,
			},
			intent: data.intent ?? null,
			content: "",
			status: "pending",
			error: null,
			createdAt: new Date().toISOString(),
			failedAt: null,
			settledAt: null,
		};

		const optimisticIndex = optimisticId
			? room.turns.findIndex((t) => t.id === optimisticId)
			: -1;

		if (optimisticIndex !== -1) {
			const next = [...room.turns];
			next[optimisticIndex] = newTurn;
			return { ...room, turns: next };
		}

		return { ...room, turns: [...room.turns, newTurn] };
	});
}

function turnStartedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnStreamStartedPayload>): void {
	// 1. Update stream store
	useTurnStreamStore.getState().startTurn(data.turnId);

	// 2. Update query cache status (keeps cache consistent for timeline/sidebar)
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		turns: room.turns.map((turn) =>
			turn.id === data.turnId ? { ...turn, status: "streaming" } : turn,
		),
	}));
}

function turnTokenHandler({ data }: SseEventContext<TurnTokenPayload>): void {
	// OPTIMIZATION: Tokens go ONLY to the Zustand store.
	// No query cache mutation. No React Query re-render.
	// Only the ParticipantTurn subscribed to data.turnId will re-render.
	if (!data.token) return;
	useTurnStreamStore.getState().appendToken(data.turnId, data.token);
}

function turnSettledHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnSettledPayload>): void {
	// 1. Finalize in stream store
	useTurnStreamStore.getState().finalizeTurn(data.turnId, data.content);

	// 2. Update query cache ONCE with final content
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		turns: room.turns.map((turn) =>
			turn.id === data.turnId
				? {
						...turn,
						status: "settled",
						content: data.content,
						settledAt: new Date().toISOString(),
					}
				: turn,
		),
	}));
}

function turnFailedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnFailedPayload>): void {
	// 1. Mark as failed in stream store
	useTurnStreamStore.getState().failTurn(data.turnId, data.error);

	// 2. Update query cache so error persists across page refreshes
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		turns: room.turns.map((turn) =>
			turn.id === data.turnId
				? {
						...turn,
						status: "failed",
						error: {
							attributes: data.error.retryAfter
								? { retryIn: data.error.retryAfter }
								: null,
							kind: data.error.kind,
							message: data.error.message,
						},
						failedAt: new Date().toISOString(),
					}
				: turn,
		),
	}));
}

// ─── Handler map ──────────────────────────────────────────────────────────────

export const ROOM_EVENT_HANDLERS: {
	[K in RoomEventName]: SseEventHandler<RoomEventPayloadMap[K]>;
} = {
	"room:deliberation-concluded": deliberationConcludedHandler,
	"room:deliberation-paused": noopHandler,
	"room:deliberation-resumed": noopHandler,
	"room:deliberation-started": deliberationStartedHandler,
	"room:formed": noopHandler,
	"room:participant-joined": participantJoinedHandler,
	"room:turn-registered": noopHandler,
	"turn:failed": turnFailedHandler,
	"turn:initiated": turnInitiatedHandler,
	"turn:settled": turnSettledHandler,
	"turn:started": turnStartedHandler,
	"turn:token": turnTokenHandler,
};
