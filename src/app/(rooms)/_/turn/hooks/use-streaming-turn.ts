/**
 * @file use-streaming-turn.ts
 * @path src/app/(rooms)/_/turn/hooks/use-streaming-turn.ts
 *
 * Hook for reading a single turn's streaming state from the Zustand store.
 *
 * ## Usage
 *
 * Use this in `ParticipantTurn` instead of reading `turn.content` and
 * `turn.status` directly from the query cache / `useRoom()` for the
 * actively-streaming turn.
 *
 * ```tsx
 * function ParticipantTurn({ turn, ...props }) {
 *   const streaming = useStreamingTurn(turn.id);
 *
 *   // During streaming: streaming.content has live tokens
 *   // After settled: streaming is null, fall back to turn.content from query cache
 *   const content = streaming?.content ?? turn.content;
 *   const isStreaming = streaming?.status === "streaming";
 * }
 * ```
 *
 * ## Re-render Behaviour
 *
 * Each `ParticipantTurn` subscribes ONLY to its own turn's slice of the store.
 * When `appendToken` updates turn X, only the component subscribed to turn X
 * re-renders. All other turn components are unaffected.
 *
 * This is the key performance improvement over the previous architecture where
 * a `setQueryData` on the full `RoomDeliberation` object caused all N turn
 * components to re-render on every token.
 */

import {
	type StreamingTurn,
	useTurnStreamStore,
} from "@briom/rooms/_/room/sse/store/turn-stream.store";
import { useCallback } from "react";

/**
 * Subscribe to a single turn's streaming state.
 *
 * Returns `null` once the turn is settled and the stream store entry is cleaned
 * up — callers should fall back to the query cache value at that point.
 */
export function useStreamingTurn(turnId: string): StreamingTurn | null {
	// Stable selector — only re-renders when THIS turn changes.
	// Using useCallback so the selector reference is stable across renders,
	// which prevents Zustand from creating a new subscription on each render.
	const selector = useCallback(
		(state: ReturnType<typeof useTurnStreamStore.getState>) =>
			state.turns.get(turnId) ?? null,
		[turnId],
	);

	return useTurnStreamStore(selector);
}

/**
 * Returns true if any turn in the store is currently streaming.
 * Used by `useDeliberation` to derive `isParticipantActive`.
 */
export function useIsAnyTurnStreaming(): boolean {
	return useTurnStreamStore((state) => state.streamingTurnId !== null);
}

/**
 * Returns the ID of the turn currently being streamed, or null.
 */
export function useStreamingTurnId(): string | null {
	return useTurnStreamStore((state) => state.streamingTurnId);
}
