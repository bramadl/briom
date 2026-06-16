"use client";

import type { TurnDTO } from "@briom/app/queries/get-room/query.dto";
import { createParser } from "eventsource-parser";
import { useCallback, useRef, useState } from "react";

interface RetryInfo {
	intent: string;
	participantId: string;
}

interface StreamState {
	retryInfo: RetryInfo | null;
	streaming: boolean;
	streamingContent: string;
	streamingParticipantId: string | null;
}

interface UseStreamOptions {
	initialTurns: TurnDTO[];
	onError?: (message: string) => void;
	onTurnComplete: (
		content: string,
		participantId: string,
		intent: string,
		turnId: string,
	) => void;
	roomId: string;
}

function findLastFailedTurn(turns: TurnDTO[]): RetryInfo | null {
	for (let i = turns.length - 1; i >= 0; i--) {
		const t = turns[i];
		if (
			t.role === "participant" &&
			t.participantId &&
			t.intent &&
			(t.status === "failed" || t.status === "pending")
		) {
			return { participantId: t.participantId, intent: t.intent };
		}
	}
	return null;
}

export function useStream({
	initialTurns,
	onError,
	onTurnComplete,
	roomId,
}: UseStreamOptions) {
	const retryInfoRef = useRef<RetryInfo | null>(
		findLastFailedTurn(initialTurns),
	);

	const [state, setState] = useState<StreamState>({
		retryInfo: retryInfoRef.current,
		streaming: false,
		streamingContent: "",
		streamingParticipantId: null,
	});

	const setRetryInfo = useCallback((info: RetryInfo | null) => {
		retryInfoRef.current = info;
		setState((prev) => ({ ...prev, retryInfo: info }));
	}, []);

	const abortRef = useRef<AbortController | null>(null);

	const abort = useCallback(() => {
		abortRef.current?.abort();
		setRetryInfo(null);
		setState((prev) => ({
			...prev,
			retryInfo: null,
			streaming: false,
			streamingContent: "",
			streamingParticipantId: null,
		}));
	}, [setRetryInfo]);

	const generate = useCallback(
		async (participantId: string, intent: string) => {
			abortRef.current?.abort();

			const controller = new AbortController();
			abortRef.current = controller;

			setRetryInfo(null);
			setState({
				retryInfo: null,
				streaming: true,
				streamingContent: "",
				streamingParticipantId: participantId,
			});

			let streamError: string | null = null;

			try {
				const res = await fetch(`/api/rooms/${roomId}/stream-response`, {
					body: JSON.stringify({ participantId, intent }),
					headers: { "Content-Type": "application/json" },
					method: "POST",
					signal: controller.signal,
				});

				if (!res.ok || !res.body) throw new Error("Stream failed");

				const reader = res.body.getReader();
				const dec = new TextDecoder();
				let finalContent = "";

				const parser = createParser({
					onEvent(event) {
						if (event.event === "start") {
							// turnId pre-allocated — available here for future use
							// e.g. showing a pending indicator tied to a real DB row
						} else if (event.event === "token") {
							const { token } = JSON.parse(event.data) as { token: string };
							finalContent += token;
							setState((prev) => ({
								...prev,
								streamingContent: finalContent,
							}));
						} else if (event.event === "done") {
							const { turnId } = JSON.parse(event.data) as {
								content: string;
								turnId: string;
							};
							onTurnComplete(finalContent, participantId, intent, turnId);
						} else if (event.event === "error") {
							const { message } = JSON.parse(event.data) as {
								message: string;
							};
							streamError = message;
						}
					},
				});

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					parser.feed(dec.decode(value, { stream: true }));
				}

				if (streamError) onError?.(streamError);
			} catch (err) {
				if ((err as Error).name !== "AbortError") {
					console.error("[Stream]", err);
					streamError = err instanceof Error ? err.message : "Stream failed";
					onError?.(streamError);
				}
			} finally {
				const nextRetryInfo = streamError ? { participantId, intent } : null;
				retryInfoRef.current = nextRetryInfo;

				setState((prev) => ({
					...prev,
					retryInfo: nextRetryInfo,
					streaming: false,
					streamingContent: "",
					streamingParticipantId: null,
				}));
			}
		},
		[onError, onTurnComplete, roomId, setRetryInfo],
	);

	// retry reads from ref — never stale regardless of render cycle
	const retry = useCallback(() => {
		const info = retryInfoRef.current;
		if (!info) return;
		void generate(info.participantId, info.intent);
	}, [generate]);

	return { ...state, abort, generate, retry };
}
