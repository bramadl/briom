import type {
	RoomDeliberationConcludedPayload,
	RoomDeliberationDTO,
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
import { useTurnStreamStore } from "../../deliberation/hooks/use-turn-stream.store";
import { roomQueries } from "../queries/registry";

import type { RoomEventName } from "./event-names";

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

const patchDeliberation = (
	queryClient: QueryClient,
	roomId: string,
	patcher: (room: RoomDeliberationDTO) => RoomDeliberationDTO,
): void => {
	queryClient.setQueryData(
		roomQueries.getRoomDeliberation({ roomId }).queryKey,
		(old) => {
			if (!old?.room) return old;
			return { room: patcher(old.room) };
		},
	);
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

function turnInitiatedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnInitiatedPayload>): void {
	useTurnStreamStore.getState().initTurn({
		id: data.turnId,
		authorType: data.authorType,
		participantId: data.participantId,
		roomId,
		sequence: data.sequence,
	});

	const optimisticId = data.clientTurnId
		? `optimistic-${data.clientTurnId}`
		: null;

	const optimisticParticipantId = data.participantId
		? `optimistic-participant-${data.participantId}`
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
			author: { type: data.authorType, profile },
			intent: data.intent ?? null,
			content: "",
			status: "pending",
			error: null,
			createdAt: new Date().toISOString(),
			failedAt: null,
			settledAt: null,
		};

		const filteredTurns = room.turns.filter((t) => {
			if (optimisticId && t.id === optimisticId) return false;
			if (optimisticParticipantId && t.id === optimisticParticipantId) {
				return false;
			}

			return true;
		});

		const optimisticIndex = optimisticId
			? room.turns.findIndex((t) => t.id === optimisticId)
			: -1;

		if (optimisticIndex !== -1) {
			const next = [...room.turns];
			next[optimisticIndex] = newTurn;

			return {
				...room,
				turns: next.filter((t) => t.id !== optimisticParticipantId),
			};
		}

		return { ...room, turns: [...filteredTurns, newTurn] };
	});
}

function turnStartedHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnStreamStartedPayload>): void {
	useTurnStreamStore.getState().startTurn(data.turnId);

	patchDeliberation(queryClient, roomId, (room) => ({
		...room,
		turns: room.turns.map((turn) =>
			turn.id === data.turnId ? { ...turn, status: "streaming" } : turn,
		),
	}));
}

function turnTokenHandler({ data }: SseEventContext<TurnTokenPayload>): void {
	if (!data.token) return;
	useTurnStreamStore.getState().appendToken(data.turnId, data.token);
}

function turnSettledHandler({
	data,
	queryClient,
	roomId,
}: SseEventContext<TurnSettledPayload>): void {
	useTurnStreamStore.getState().finalizeTurn(data.turnId, data.content);

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
	useTurnStreamStore.getState().failTurn(data.turnId, data.error);

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
