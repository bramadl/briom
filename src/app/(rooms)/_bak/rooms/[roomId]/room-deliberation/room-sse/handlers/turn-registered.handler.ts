import type { RoomTurnRegisteredPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { patchRoom } from "./helpers";

export const turnRegisteredHandler: SseEventHandler<RoomTurnRegisteredPayload> =
	{
		handle: ({ data, queryClient, roomId }) => {
			patchRoom(queryClient, roomId, (room) => {
				if (room.turnIds.includes(data.turnId)) return room;
				return {
					...room,
					turnIds: [...room.turnIds, data.turnId],
				};
			});
		},
	};
