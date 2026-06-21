import type { TurnStreamStartedPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { patchTurns } from "./helpers";

export const turnStartedHandler: SseEventHandler<TurnStreamStartedPayload> = {
	handle: ({ data, queryClient, roomId }) => {
		patchTurns(queryClient, roomId, (turns) =>
			turns.map((turn) =>
				turn.id === data.turnId ? { ...turn, status: "streaming" } : turn,
			),
		);
	},
};
