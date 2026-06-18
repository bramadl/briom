"use client";

import { toStreamEventError } from "@briom/app/_bak/api/contracts/errors";
import type { StreamEventError } from "@briom/app/_bak/api/contracts/types";
import { createParser } from "eventsource-parser";
import { useCallback, useEffect, useRef, useState } from "react";

import type { StreamResult, UseStreamState } from "./types";

const DELETE_TURN_URL = (roomId: string, turnId: string) =>
	`/api/rooms/${roomId}/turns/${turnId}`;

const STREAM_API_URL = (roomId: string) =>
	`/api/rooms/${roomId}/stream-response`;

const IDLE_STATE: UseStreamState = {
	streamError: null,
	streaming: false,
	streamingContent: "",
	streamingParticipantId: null,
	streamPhase: "idle",
};

interface UseStreamReturn extends UseStreamState {
	abort: () => void;
	generate: (participantId: string, intent: string) => Promise<StreamResult>;
}

export function useStream(roomId: string): UseStreamReturn {
	const [state, setState] = useState<UseStreamState>(IDLE_STATE);

	const abortRef = useRef<AbortController | null>(null);
	const pendingTurnIdRef = useRef<string | null>(null);

	const abort = useCallback(() => {
		const turnId = pendingTurnIdRef.current;

		abortRef.current?.abort();
		if (turnId) {
			fetch(DELETE_TURN_URL(roomId, turnId), { method: "DELETE" }).catch(
				() => {},
			);
		}

		pendingTurnIdRef.current = null;
		setState(IDLE_STATE);
	}, [roomId]);

	useEffect(() => {
		const handleBeforeUnload = () => abort();
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			abort();
		};
	}, [abort]);

	const generate = useCallback(
		async (participantId: string, intent: string): Promise<StreamResult> => {
			abortRef.current?.abort();
			pendingTurnIdRef.current = null;

			const controller = new AbortController();
			abortRef.current = controller;

			setState({
				streamError: null,
				streaming: true,
				streamingContent: "",
				streamingParticipantId: participantId,
				streamPhase: "connecting",
			});

			let finalContent = "";
			let streamError: StreamEventError | null = null;
			let turnId: string | undefined;

			try {
				const res = await fetch(STREAM_API_URL(roomId), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ participantId, intent }),
					signal: controller.signal,
				});

				if (!res.ok || !res.body) throw new Error("Stream failed");

				const reader = res.body.getReader();
				const decoder = new TextDecoder();

				const parser = createParser({
					onEvent(event) {
						switch (event.event) {
							case "start": {
								const { turnId: id } = JSON.parse(event.data) as {
									turnId: string;
								};

								turnId = id;
								pendingTurnIdRef.current = id;

								setState((prev) => ({ ...prev, streamPhase: "thinking" }));
								break;
							}
							case "token": {
								const { token } = JSON.parse(event.data) as { token: string };
								finalContent += token;

								setState((prev) => ({
									...prev,
									streamingContent: finalContent,
									streamPhase: "streaming",
								}));
								break;
							}
							case "done": {
								const payload = JSON.parse(event.data) as {
									content: string;
									turnId: string;
								};

								turnId = payload.turnId;
								setState((prev) => ({
									...prev,
									streaming: false,
									streamingContent: "",
									streamingParticipantId: null,
									streamPhase: "idle",
								}));

								break;
							}
							case "error": {
								streamError = JSON.parse(event.data) as StreamEventError;
								break;
							}
						}
					},
				});

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					parser.feed(decoder.decode(value, { stream: true }));
				}

				if (streamError) setState((prev) => ({ ...prev, streamError }));
			} catch (err) {
				if ((err as Error).name !== "AbortError") {
					streamError = toStreamEventError(err);
					setState((prev) => ({ ...prev, streamError }));
				}
			} finally {
				pendingTurnIdRef.current = null;
				setState((prev) => {
					if (prev.streamPhase === "idle") return prev;
					return {
						...prev,
						streaming: false,
						streamingContent: "",
						streamingParticipantId: null,
						streamPhase: "idle",
					};
				});
			}

			const nextRetryInfo = streamError
				? { id: turnId, participantId, intent }
				: null;

			return {
				content: finalContent,
				turnId,
				error: streamError,
				retryInfo: nextRetryInfo,
			};
		},
		[roomId],
	);

	return { ...state, generate, abort };
}
