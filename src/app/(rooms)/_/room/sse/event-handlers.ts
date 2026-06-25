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
	"room:turn-registered": noopHandler,
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

function turnFailedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnFailedPayload>): void {
	flushTokenBuffer();
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		turns: room.turns.map((turn) =>
			turn.id === data.turnId
				? {
						...turn,
						status: "failed",
						error: {
							attributes: data.error.retryAfter
								? {
										retryIn: data.error.retryAfter,
									}
								: null,
							kind: data.error.kind,
							message: data.error.message,
						},
					}
				: turn,
		),
	}));
}

function turnInitiatedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnInitiatedPayload>): void {
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
					? { displayName: participant.name, model: participant.model }
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

function turnSettledHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnSettledPayload>): void {
	flushTokenBuffer();
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		turns: room.turns.map((turn) =>
			turn.id === data.turnId
				? {
						...turn,
						status: "settled",
						content: data.content,
					}
				: turn,
		),
	}));
}

function turnStartedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnStreamStartedPayload>): void {
	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		turns: room.turns.map((turn) =>
			turn.id === data.turnId ? { ...turn, status: "streaming" } : turn,
		),
	}));
}

function turnTokenHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnTokenPayload>): void {
	if (!data.token) return;
	bufferToken(queryClient, roomId, data.turnId, data.token);
}
