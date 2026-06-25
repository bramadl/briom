import type { QueryClient } from "@tanstack/react-query";

import { patchDeliberation } from "./query-patchers";

interface PendingTurn {
	roomId: string;
	text: string;
}

const pending = new Map<string, PendingTurn>();

let rafHandle: number | null = null;
let activeQueryClient: QueryClient | null = null;

export function bufferToken(
	queryClient: QueryClient,
	roomId: string,
	turnId: string,
	token: string,
): void {
	const existing = pending.get(turnId);
	pending.set(turnId, {
		roomId,
		text: (existing?.text ?? "") + token,
	});

	activeQueryClient = queryClient;
	scheduleFlush();
}

export function flushTokenBuffer(): void {
	if (pending.size === 0 || !activeQueryClient) return;
	drain(activeQueryClient);
}

function scheduleFlush(): void {
	if (rafHandle !== null) return;
	rafHandle = requestAnimationFrame(() => {
		rafHandle = null;
		if (activeQueryClient) drain(activeQueryClient);
	});
}

function drain(queryClient: QueryClient): void {
	if (pending.size === 0) return;

	const byRoom = new Map<string, Map<string, string>>();
	for (const [turnId, { roomId, text }] of pending) {
		const room = byRoom.get(roomId) ?? new Map<string, string>();
		room.set(turnId, text);
		byRoom.set(roomId, room);
	}
	pending.clear();

	for (const [roomId, turnTexts] of byRoom) {
		patchDeliberation(queryClient, roomId, (room) => ({
			...room,
			turns: room.turns.map((turn) => {
				const bufferedText = turnTexts.get(turn.id);
				if (bufferedText === undefined) return turn;

				return {
					...turn,
					content: turn.content + bufferedText,
					status: turn.status === "pending" ? "streaming" : turn.status,
				};
			}),
		}));
	}
}
