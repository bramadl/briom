import type {
	RoomDeliberationConcludedPayload,
	RoomDeliberationStartedPayload,
	RoomParticipantJoinedPayload,
	RoomTurnRegisteredPayload,
	TurnDTO,
	TurnFailedPayload,
	TurnInitiatedPayload,
	TurnSettledPayload,
	TurnStreamStartedPayload,
	TurnTokenPayload,
} from "@briom/app";
import type { QueryClient } from "@tanstack/react-query";

import type { RoomEventName } from "./event-names";
import { patchRoom, patchTurns } from "./helpers/query-patchers";
import { bufferToken, flushTokenBuffer } from "./helpers/token-buffers";

type SseEventContext<TPayload = unknown> = {
	data: TPayload;
	queryClient: QueryClient;
	roomId: string;
};

type SseEventHandler<TPayload = unknown> = (
	ctx: SseEventContext<TPayload>,
) => void;

export const ROOM_EVENT_HANDLERS: Record<
	RoomEventName,
	// biome-ignore lint/suspicious/noExplicitAny: structural — no variance issues
	SseEventHandler<any>
> = {
	"room:deliberation-concluded": deliberationConcludedHandler,
	"room:deliberation-paused": noopHandler,
	"room:deliberation-resumed": noopHandler,
	"room:deliberation-started": deliberationStartedHandler,
	"room:formed": noopHandler,
	"room:participant-joined": participantJoinedHandler,
	"room:turn-registered": turnRegisteredHandler,
	"turn:failed": turnFailedHandler,
	"turn:initiated": turnInitiatedHandler,
	"turn:settled": turnSettledHandler,
	"turn:started": turnStartedHandler,
	"turn:token": turnTokenHandler,
};

function noopHandler(_: SseEventContext): void {}

function deliberationConcludedHandler({
	queryClient,
	roomId,
}: SseEventContext<RoomDeliberationConcludedPayload>): void {
	patchRoom(queryClient, roomId, (room) => ({
		...room,
		status: "concluded",
	}));
}

function deliberationStartedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<RoomDeliberationStartedPayload>): void {
	patchRoom(queryClient, roomId, (room) => ({
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
	patchRoom(queryClient, roomId, (room) => {
		if (room.participants.some((p) => p.id === data.participantId)) return room;
		return {
			...room,
			participants: [
				...room.participants,
				{
					id: data.participantId,
					model: data.model,
					name: data.name,
					provider: data.provider,
					qualifiedModel: data.qualifiedModel,
				},
			],
		};
	});
}

function turnRegisteredHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<RoomTurnRegisteredPayload>): void {
	patchRoom(queryClient, roomId, (room) => {
		if (room.turnIds.includes(data.turnId)) return room;
		return {
			...room,
			turnIds: [...room.turnIds, data.turnId],
		};
	});
}

function turnFailedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnFailedPayload>): void {
	flushTokenBuffer();
	patchTurns(queryClient, roomId, (turns) =>
		turns.map((turn) =>
			turn.id === data.turnId
				? {
						...turn,
						status: "failed",
						error: data.error,
						failedAt: new Date().toISOString(),
					}
				: turn,
		),
	);
}

function turnInitiatedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnInitiatedPayload>): void {
	const optimisticId = data.clientTurnId
		? `optimistic-${data.clientTurnId}`
		: null;

	patchTurns(queryClient, roomId, (turns) => {
		const existingIndex = turns.findIndex((t) => t.id === data.turnId);

		if (existingIndex !== -1) {
			const existing = turns[existingIndex];
			if (existing.status === "pending") return turns;

			const next = [...turns];
			next[existingIndex] = {
				...existing,
				status: "pending",
				perspective: { content: "", renderedAt: null },
				error: null,
				failedAt: null,
				settledAt: null,
			};

			return next;
		}

		const now = new Date().toISOString();
		const newTurn: TurnDTO = {
			id: data.turnId,
			roomId,
			sequence: data.sequence,
			author: {
				type: data.authorType,
				moderatorId: data.moderatorId ?? undefined,
				participantId: data.participantId ?? undefined,
			},
			intent: data.intent ?? null,
			perspective: { content: "", renderedAt: null },
			status: "pending",
			tokens: [],
			error: null,
			previousTurnId: null,
			createdAt: now,
			settledAt: null,
			failedAt: null,
		};

		const optimisticIndex = optimisticId
			? turns.findIndex((t) => t.id === optimisticId)
			: -1;

		if (optimisticIndex !== -1) {
			const next = [...turns];
			next[optimisticIndex] = newTurn;
			return next;
		}

		return [...turns, newTurn];
	});

	if (optimisticId) {
		patchRoom(queryClient, roomId, (room) => {
			if (!room.turnIds.includes(optimisticId)) return room;
			return {
				...room,
				turnIds: room.turnIds.map((id) =>
					id === optimisticId ? data.turnId : id,
				),
			};
		});
	}
}

function turnSettledHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnSettledPayload>): void {
	flushTokenBuffer();
	patchTurns(queryClient, roomId, (turns) =>
		turns.map((turn) =>
			turn.id === data.turnId
				? {
						...turn,
						status: "settled",
						perspective: {
							content: data.content,
							renderedAt: new Date().toISOString(),
						},
						settledAt: new Date().toISOString(),
					}
				: turn,
		),
	);
}

function turnStartedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnStreamStartedPayload>): void {
	patchTurns(queryClient, roomId, (turns) =>
		turns.map((turn) =>
			turn.id === data.turnId ? { ...turn, status: "streaming" } : turn,
		),
	);
}

function turnTokenHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnTokenPayload>): void {
	if (!data.token) return;
	bufferToken(queryClient, roomId, data.turnId, data.token);
}
