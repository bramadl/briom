"use client";

import type { RoomTurnDTO } from "@briom/core/app";
import {
	useActiveTurnError,
	useActiveTurnPhase,
	useIsActiveTurn,
	useLiveTurnContent,
} from "../store/turn-stream.store";

export function useTurnStreaming(params: {
	turnId: string;
	settledContent?: string;
	settledStatus?: RoomTurnDTO["status"];
}) {
	const { turnId, settledContent, settledStatus } = params;

	const isActive = useIsActiveTurn(turnId);
	const liveContent = useLiveTurnContent(turnId);
	const phase = useActiveTurnPhase();
	const error = useActiveTurnError();

	const hasSettledContent = !!settledContent && settledContent.length > 0;

	const content = isActive
		? liveContent
		: hasSettledContent
			? (settledContent as string)
			: liveContent;

	const status = isActive
		? phase === "idle"
			? "pending"
			: phase
		: (settledStatus ?? "settled");

	const isStreaming = isActive && status === "streaming";

	return { content, status, error, isActive, isStreaming };
}
