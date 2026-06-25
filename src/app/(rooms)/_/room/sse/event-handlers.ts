import type {
	RoomDeliberationConcludedPayload,
	RoomDeliberationPausedPayload,
	RoomDeliberationResumedPayload,
	RoomDeliberationStartedPayload,
	RoomDeliberationTurnDTO,
	RoomFormedPayload,
	RoomParticipantJoinedPayload,
	RoomTurnRegisteredPayload,
	TurnFailedPayload,
	TurnInitiatedPayload,
	TurnSettledPayload,
	TurnStreamStartedPayload,
	TurnTokenPayload,
} from "@briom/app";
import type { QueryClient } from "@tanstack/react-query";

import type { RoomEventName } from "./event-names";
import { patchDeliberation } from "./helpers/query-patchers";
import { getTokenBufferManager } from "./helpers/token-buffers";

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
	"room:deliberation-paused": RoomDeliberationPausedPayload;
	"room:deliberation-resumed": RoomDeliberationResumedPayload;
	"room:deliberation-started": RoomDeliberationStartedPayload;
	"room:formed": RoomFormedPayload;
	"room:participant-joined": RoomParticipantJoinedPayload;
	"room:turn-registered": RoomTurnRegisteredPayload;
	"turn:failed": TurnFailedPayload;
	"turn:initiated": TurnInitiatedPayload;
	"turn:settled": TurnSettledPayload;
	"turn:started": TurnStreamStartedPayload;
	"turn:token": TurnTokenPayload;
}

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
	getTokenBufferManager().flush();
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

function turnSettledHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnSettledPayload>): void {
	getTokenBufferManager().flush();
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
	getTokenBufferManager().buffer(queryClient, roomId, data.turnId, data.token);
}
