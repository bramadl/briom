import type { TurnFailedPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { patchTurns } from "./helpers";
import { flushTokenBuffer } from "./token-buffer";

export const turnFailedHandler: SseEventHandler<TurnFailedPayload> = {
	handle: ({ data, queryClient, roomId }) => {
		flushTokenBuffer();
		patchTurns(queryClient, roomId, (turns) =>
			turns.map((turn) =>
				turn.id === data.turnId
					? {
							...turn,
							status: "failed",
							error: data.error,
							failedAt: new Date().toISOString(),
						}
					: turn,
			),
		);
	},
};
