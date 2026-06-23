import type { TurnTokenPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { bufferToken } from "./token-buffer";

/**
 * @description
 * Buffers the incoming token instead of writing it to the query cache
 * immediately. See `token-buffer.ts` for why: this keeps SSE arrival
 * rate (network-bound, bursty) from directly driving React's render
 * rate (which should be capped to roughly once per frame).
 */
export const turnTokenHandler: SseEventHandler<TurnTokenPayload> = {
	handle: ({ data, queryClient, roomId }) => {
		if (!data.token) return;
		bufferToken(queryClient, roomId, data.turnId, data.token);
	},
};
