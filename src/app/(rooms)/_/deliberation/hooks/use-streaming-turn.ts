import { useCallback } from "react";

import {
	type StreamingTurn,
	useTurnStreamStore,
} from "./use-turn-stream.store";

export function useStreamingTurn(turnId: string): StreamingTurn | null {
	const selector = useCallback(
		(state: ReturnType<typeof useTurnStreamStore.getState>) =>
			state.turns.get(turnId) ?? null,
		[turnId],
	);

	return useTurnStreamStore(selector);
}

export function useIsAnyTurnStreaming(): boolean {
	return useTurnStreamStore((state) => state.streamingTurnId !== null);
}

export function useStreamingTurnId(): string | null {
	return useTurnStreamStore((state) => state.streamingTurnId);
}
