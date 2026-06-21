import type { TurnDTO, TurnInitiatedPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { patchRoom, patchTurns } from "./helpers";

export const turnInitiatedHandler: SseEventHandler<TurnInitiatedPayload> = {
	handle: ({ data, queryClient, roomId }) => {
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
	},
};
