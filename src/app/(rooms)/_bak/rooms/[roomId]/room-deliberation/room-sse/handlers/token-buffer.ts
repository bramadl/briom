import type { QueryClient } from "@tanstack/react-query";

import { patchTurns } from "./helpers";

/**
 * @description
 * Decouples raw `turn:token` SSE arrival from React render rate.
 *
 * **The problem this solves**
 * Each `turn:token` event used to call `queryClient.setQueryData`
 * directly and synchronously. That meant: every SSE message (potentially
 * many per animation frame, especially once backend broadcasting is no
 * longer gated by a DB round-trip) triggered its own React Query cache
 * write, its own re-render of every subscriber of the `turns` query, and
 * — for the streaming turn — a full markdown re-parse. The render rate
 * was effectively uncapped and at the mercy of network burstiness.
 *
 * **The fix**
 * Incoming text is appended to a small in-memory buffer keyed by
 * `turnId`. A single `requestAnimationFrame` loop — shared across all
 * turns, started lazily on the first buffered token and stopped once
 * everything's flushed — drains all dirty buffers into ONE `setQueryData`
 * call per frame. This bounds the *render* rate to the display's refresh
 * rate regardless of how bursty the underlying SSE delivery is, while
 * still feeling live (nothing is held back longer than a frame).
 *
 * This module is intentionally framework-agnostic React-wise (no hooks) —
 * `sse-handlers.ts` invokes plain functions, matching the existing
 * `SseEventHandler.handle` contract, which is synchronous.
 */

interface PendingTurn {
	roomId: string;
	text: string;
}

/** turnId -> buffered, not-yet-flushed text */
const pending = new Map<string, PendingTurn>();

let rafHandle: number | null = null;
let activeQueryClient: QueryClient | null = null;

/**
 * @description
 * Buffers a token chunk for the given turn. Safe to call many times per
 * frame — text is concatenated, not re-rendered, until the next flush.
 */
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

/**
 * @description
 * Immediately flushes all buffered tokens, bypassing the next animation
 * frame. Used when a turn settles or fails so trailing buffered text
 * isn't dropped or delayed behind the terminal event.
 */
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

	// Group buffered turns by room — in practice almost always one room,
	// since each browser tab subscribes to a single room's channel, but
	// grouping keeps this correct if that ever changes.
	const byRoom = new Map<string, Map<string, string>>();
	for (const [turnId, { roomId, text }] of pending) {
		const room = byRoom.get(roomId) ?? new Map<string, string>();
		room.set(turnId, text);
		byRoom.set(roomId, room);
	}
	pending.clear();

	for (const [roomId, turnTexts] of byRoom) {
		patchTurns(queryClient, roomId, (turns) =>
			turns.map((turn) => {
				const bufferedText = turnTexts.get(turn.id);
				if (bufferedText === undefined) return turn;

				return {
					...turn,
					perspective: {
						...turn.perspective,
						content: turn.perspective.content + bufferedText,
					},
					status: turn.status === "pending" ? "streaming" : turn.status,
				};
			}),
		);
	}
}
