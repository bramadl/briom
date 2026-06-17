"use client";

import type { StreamEventError } from "@briom/api/contracts/types";
import type { TurnDTO } from "@briom/app/queries/get-room/query.dto";
import { useCallback, useState } from "react";

import type { RetryInfo } from "./helpers";
import { useFailureStreamHandler } from "./use-failure-stream-handler";
import { useStream } from "./use-stream";

const DELETE_TURN_URL = (roomId: string, turnId: string) =>
	`/api/rooms/${roomId}/turns/${turnId}`;

interface UseResponseStreamOptions {
	onTurnComplete: (
		content: string,
		participantId: string,
		intent: string,
		turnId: string,
	) => void;
	roomId: string;
	turns: TurnDTO[];
}

export function useResponseStream({
	turns,
	onTurnComplete,
	roomId,
}: UseResponseStreamOptions) {
	const {
		streaming,
		streamingContent,
		streamingParticipantId,
		streamPhase,
		generate,
		abort,
	} = useStream(roomId);

	const {
		retryInfo: failureRetryInfo,
		streamError: failureError,
		dismiss,
		clear: clearFailure,
	} = useFailureStreamHandler(turns);

	const [lastAttempt, setLastAttempt] = useState<{
		retryInfo: RetryInfo;
		error: StreamEventError;
	} | null>(null);

	const retryInfo = lastAttempt?.retryInfo ?? failureRetryInfo;
	const activeError = lastAttempt?.error ?? (failureError as StreamEventError);

	const wrappedGenerate = useCallback(
		async (participantId: string, intent: string) => {
			clearFailure();
			setLastAttempt(null);

			const result = await generate(participantId, intent);
			if (result.error && result.retryInfo) {
				setLastAttempt({ retryInfo: result.retryInfo, error: result.error });
			} else if (result.turnId && !result.error) {
				onTurnComplete(result.content, participantId, intent, result.turnId);
			}
		},
		[generate, onTurnComplete, clearFailure],
	);

	const retry = useCallback(() => {
		if (!retryInfo) return;
		if (retryInfo.id) {
			fetch(DELETE_TURN_URL(roomId, retryInfo.id), { method: "DELETE" }).catch(
				() => {},
			);
		}

		clearFailure();
		setLastAttempt(null);
		void wrappedGenerate(retryInfo.participantId, retryInfo.intent);
	}, [retryInfo, wrappedGenerate, clearFailure, roomId]);

	const dismissError = useCallback(() => {
		dismiss();
		setLastAttempt(null);
	}, [dismiss]);

	return {
		streaming,
		streamingContent,
		streamingParticipantId,
		streamPhase,
		streamError: activeError,
		retryInfo,
		canRetry: retryInfo != null,
		retry,
		dismissError,
		generate: wrappedGenerate,
		abort,
	};
}
