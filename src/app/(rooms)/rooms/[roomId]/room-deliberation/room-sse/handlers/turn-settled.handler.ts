import type { TurnSettledPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { patchTurns } from "./helpers";
import { flushTokenBuffer } from "./token-buffer";

export const turnSettledHandler: SseEventHandler<TurnSettledPayload> = {
	handle: ({ data, queryClient, roomId }) => {
		flushTokenBuffer();
		patchTurns(queryClient, roomId, (turns) =>
			turns.map((turn) =>
				turn.id === data.turnId
					? {
							...turn,
							status: "settled",
							perspective: {
								content: data.content,
								renderedAt: new Date().toISOString(),
							},
							settledAt: new Date().toISOString(),
						}
					: turn,
			),
		);
	},
};
