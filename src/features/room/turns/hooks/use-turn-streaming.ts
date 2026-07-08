"use client";

import {
	useActiveTurnError,
	useActiveTurnPhase,
	useIsActiveTurn,
	useLiveTurnContent,
} from "../store/turn-stream.store";

export function useTurnStreaming(params: {
	turnId: string;
	settledContent?: string;
}) {
	const { turnId, settledContent } = params;

	const isActive = useIsActiveTurn(turnId);
	const liveContent = useLiveTurnContent(turnId);
	const phase = useActiveTurnPhase();
	const error = useActiveTurnError();

	const hasSettledContent = !!settledContent && settledContent.length > 0;

	// No auto-release here on purpose. Previously this tried to clear the
	// store's tracking as soon as the React Query cache "caught up" to
	// confirm the terminal state (settled/failed/abandoned) — but that
	// created a race against the OTHER thing that flips isActive: a
	// second, independent invalidation (e.g. TurnSlotReleased refetching
	// roomKey) landing before or after this turn's own settle/fail event
	// had a chance to fully render. Whichever cache resolved first would
	// silently flip isActive out from under a still-rendering component,
	// switching its data source (store -> cache) mid-flight and producing
	// a visible one-tick UI mutation (label changing, Retry button
	// appearing, error text updating) even though nothing the user did
	// caused it.
	//
	// The store's tracked turn is cheap to keep around — it's one turn's
	// worth of phase/error/content — so there's no need to race to free
	// it. It gets superseded naturally the moment a new turn is claimed
	// (claimTurn overwrites trackedTurnId), and fully wiped on room
	// unmount/switch (hardReset). No effect, no race, no flicker.

	const content = isActive
		? liveContent
		: hasSettledContent
			? (settledContent as string)
			: liveContent;

	const status = isActive ? (phase === "idle" ? "pending" : phase) : "settled";
	const isStreaming = isActive && status === "streaming";

	return { content, status, error, isActive, isStreaming };
}
