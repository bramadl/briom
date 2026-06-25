/**
 * @file turn-stream.store.ts
 * @path src/app/(rooms)/_/room/sse/store/turn-stream.store.ts
 *
 * Dedicated Zustand store for in-flight streaming turn state.
 *
 * ## Why This Exists
 *
 * The previous architecture routed every `turn:token` SSE event through
 * React Query's `setQueryData`, which mutated the full `RoomDeliberation`
 * cache object on every token. That triggered a re-render of the entire
 * `TurnSequence` tree — all N turn cards, all their memoized children,
 * all their ReactMarkdown instances — for every single token.
 *
 * This store decouples the hot streaming path from the query cache:
 * - Tokens accumulate here (Zustand), not in query cache
 * - Only the actively-streaming `TurnItem` subscribes to its own slice
 * - Query cache is only updated once, on `turn:settled`
 *
 * ## Lifecycle
 *
 * ```
 * turn:initiated  → initTurn()          [store: add pending turn]
 * turn:started    → startTurn()         [store: mark streaming]
 * turn:token      → appendToken()       [store: accumulate content]
 * turn:settled    → finalizeTurn()      [store: mark settled, content frozen]
 *                 ↓ also triggers:
 *                   queryClient.setQueryData() ← only once per turn
 * turn:failed     → failTurn()          [store: mark failed]
 * ```
 *
 * ## Scoping
 *
 * One store instance, keyed by `turnId`. Turns are added when initiated
 * and cleaned up when the SSE channel closes (room unmount).
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StreamingTurnStatus =
	| "pending"
	| "streaming"
	| "settled"
	| "failed";

export interface StreamingTurn {
	authorType: "moderator" | "participant";
	content: string;
	error: { kind: string; message: string; occurredAt: string } | null;
	id: string;
	participantId: string | null;
	roomId: string;
	sequence: number;
	status: StreamingTurnStatus;
}

interface TurnStreamState {
	/** Append a token to the streaming turn's content (from turn:token) */
	appendToken: (turnId: string, token: string) => void;

	/** Remove all streaming turns for a room (on SSE disconnect) */
	clearRoom: (roomId: string) => void;

	/** Mark the turn as failed (from turn:failed) */
	failTurn: (
		turnId: string,
		error: { kind: string; message: string; occurredAt: string },
	) => void;

	/** Finalize the turn with complete content (from turn:settled) */
	finalizeTurn: (turnId: string, content: string) => void;

	// ─── Selectors ──────────────────────────────────────────────────────────

	/** Get a single turn by ID — used for per-turn subscriptions */
	getTurn: (turnId: string) => StreamingTurn | undefined;

	// ─── Actions ────────────────────────────────────────────────────────────

	/** Register a new turn as pending (from turn:initiated) */
	initTurn: (turn: Omit<StreamingTurn, "content" | "status" | "error">) => void;

	/** Whether there is currently an active streaming turn */
	isAnyTurnStreaming: () => boolean;

	/** Mark a pending turn as actively streaming (from turn:started) */
	startTurn: (turnId: string) => void;
	streamingTurnId: string | null;
	// ─── State ──────────────────────────────────────────────────────────────
	turns: Map<string, StreamingTurn>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTurnStreamStore = create<TurnStreamState>()(
	subscribeWithSelector((set, get) => ({
		turns: new Map(),
		streamingTurnId: null,

		initTurn(turn) {
			set((state) => {
				const next = new Map(state.turns);
				next.set(turn.id, {
					...turn,
					content: "",
					status: "pending",
					error: null,
				});
				return { turns: next };
			});
		},

		startTurn(turnId) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, { ...existing, status: "streaming" });
				return { turns: next, streamingTurnId: turnId };
			});
		},

		appendToken(turnId, token) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, {
					...existing,
					content: existing.content + token,
					status: "streaming",
				});
				return { turns: next, streamingTurnId: turnId };
			});
		},

		finalizeTurn(turnId, content) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, { ...existing, content, status: "settled" });
				return {
					turns: next,
					streamingTurnId:
						state.streamingTurnId === turnId ? null : state.streamingTurnId,
				};
			});
		},

		failTurn(turnId, error) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, { ...existing, status: "failed", error });
				return {
					turns: next,
					streamingTurnId:
						state.streamingTurnId === turnId ? null : state.streamingTurnId,
				};
			});
		},

		clearRoom(roomId) {
			set((state) => {
				const next = new Map(state.turns);
				for (const [id, turn] of next) {
					if (turn.roomId === roomId) next.delete(id);
				}
				return {
					turns: next,
					streamingTurnId:
						state.streamingTurnId &&
						state.turns.get(state.streamingTurnId)?.roomId === roomId
							? null
							: state.streamingTurnId,
				};
			});
		},

		getTurn(turnId) {
			return get().turns.get(turnId);
		},

		isAnyTurnStreaming() {
			return get().streamingTurnId !== null;
		},
	})),
);
