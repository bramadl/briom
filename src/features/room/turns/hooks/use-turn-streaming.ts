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
	cacheStatus?: string;
}) {
	const { turnId, settledContent, cacheStatus } = params;

	const isActive = useIsActiveTurn(turnId);
	const liveContent = useLiveTurnContent(turnId);
	const phase = useActiveTurnPhase();
	const error = useActiveTurnError();

	const hasSettledContent = !!settledContent && settledContent.length > 0;
	const cacheConfirmsTerminal =
		cacheStatus === "settled" ||
		cacheStatus === "failed" ||
		cacheStatus === "abandoned";

	useEffect(() => {
		if (!isActive) return;
		const storeSaysTerminal =
			phase === "settled" || phase === "failed" || phase === "abandoned";

		if (storeSaysTerminal && (hasSettledContent || cacheConfirmsTerminal)) {
			turnStreamActions.clearLiveContent(turnId);
		}
	}, [isActive, phase, hasSettledContent, cacheConfirmsTerminal, turnId]);

	const content = isActive
		? liveContent
		: hasSettledContent
			? (settledContent as string)
			: liveContent;

	const status = isActive ? (phase === "idle" ? "pending" : phase) : "settled";
	const isStreaming = isActive && status === "streaming";

	return { content, status, error, isActive, isStreaming };
}
