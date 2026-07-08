"use client";

import { useEffect } from "react";

import {
	turnStreamActions,
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

	useEffect(() => {
		if (!isActive && hasSettledContent) {
			turnStreamActions.clearLiveContent(turnId);
		}
	}, [isActive, hasSettledContent, turnId]);

	const content = isActive
		? liveContent
		: hasSettledContent
			? (settledContent as string)
			: liveContent;

	const status = isActive ? (phase === "idle" ? "pending" : phase) : "settled";
	const isStreaming = isActive && status === "streaming";

	return { content, status, error, isActive, isStreaming };
}
