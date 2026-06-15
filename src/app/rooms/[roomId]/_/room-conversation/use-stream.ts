"use client";

import { useCallback, useRef, useState } from "react";
import { createParser } from "eventsource-parser";

interface StreamState {
  error: string | null;
  streaming: boolean;
  streamingContent: string;
  streamingParticipantId: string | null;
}

interface UseStreamOptions {
  onError?: (message: string) => void;
  onTurnComplete: (content: string, participantId: string) => void;
  roomId: string;
}

export function useStream({ onError, onTurnComplete, roomId }: UseStreamOptions) {
  const [state, setState] = useState<StreamState>({
    streaming: false,
    streamingContent: "",
    streamingParticipantId: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (participantId: string, intent: string) => {
      abortRef.current?.abort();

      const abort = new AbortController();
      abortRef.current = abort;

      setState({
        streaming: true,
        streamingContent: "",
        streamingParticipantId: participantId,
        error: null,
      });

      try {
        const res = await fetch(`/api/rooms/${roomId}/turns/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId, intent }),
          signal: abort.signal,
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let finalContent = "";
        let streamError: string | null = null;

        const parser = createParser({
          onEvent(event) {
            if (event.event === "token") {
              const { token } = JSON.parse(event.data) as { token: string };
              finalContent += token;
              setState((prev) => ({
                ...prev,
                streamingContent: prev.streamingContent + token,
              }));
            } else if (event.event === "done") {
              onTurnComplete(finalContent, participantId);
            } else if (event.event === "error") {
              const { message } = JSON.parse(event.data) as { message: string };
              streamError = message;
            }
          },
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.feed(dec.decode(value, { stream: true }));
        }

        if (streamError) {
          if (onError) onError(streamError)
          else setState((prev) => ({ ...prev, error: streamError }));
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[Stream]", err);
          const msg = err instanceof Error ? err.message : "Stream failed";
          if (onError) onError(msg)
          else setState((prev) => ({ ...prev, error: msg, }));
        }
      } finally {
        setState((prev) => ({
          ...prev,
          streaming: false,
          streamingContent: "",
          streamingParticipantId: null,
        }));
      }
    },
    [roomId, onTurnComplete],
  );

  return { ...state, generate };
}