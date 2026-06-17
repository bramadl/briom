import type { StreamEventError } from "@briom/api/contracts/types";

import type { RetryInfo } from "../helpers";

export type StreamPhase = "idle" | "connecting" | "thinking" | "streaming";

export interface StreamResult {
	content: string;
	error: StreamEventError | null;
	retryInfo: RetryInfo | null;
	turnId?: string;
}

export interface UseStreamState {
	streamError: StreamEventError | null;
	streaming: boolean;
	streamingContent: string;
	streamingParticipantId: string | null;
	streamPhase: StreamPhase;
}
