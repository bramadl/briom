"use client";

import { useEffect } from "react";

import {
	turnStreamActions,
	useActiveTurnError,
	useActiveTurnPhase,
	useIsActiveTurn,
	useLiveTurnContent,
} from "../store/turn-stream.store";

/**
 * @description
 * Single source of "what content should this turn render right now",
 * covering both the actively-streaming case AND the just-settled gap
 * before the room refetch lands.
 *
 * `settledContent` is whatever the room DTO currently has for this
 * turn. This hook resolves the seam: while the turn is active, content
 * comes from the live store; once inactive, prefer the room DTO's
 * content, but fall back to the last live content if the DTO hasn't
 * caught up yet. The moment the DTO does have real content,
 * `liveContent[turnId]` is cleared.
 */
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

	useEffect(() => {
		if (!isActive && hasSettledContent) {
			turnStreamActions.clearLiveContent(turnId);
		}
	}, [isActive, hasSettledContent, turnId]);

	const content = isActive
		? liveContent
		: hasSettledContent
			? (settledContent as string)
			: liveContent; // room DTO hasn't caught up yet — bridge the gap

	const status = isActive ? (phase === "idle" ? "pending" : phase) : "settled";
	const isStreaming = isActive && status === "streaming";

	return { content, status, error, isActive, isStreaming };
}
