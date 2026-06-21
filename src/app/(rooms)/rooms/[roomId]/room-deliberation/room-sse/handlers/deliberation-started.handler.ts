import type { RoomDeliberationStartedPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { patchRoom } from "./helpers";

export const deliberationStartedHandler: SseEventHandler<RoomDeliberationStartedPayload> =
	{
		handle: ({ data, queryClient, roomId }) => {
			patchRoom(queryClient, roomId, (room) => ({
				...room,
				topic: data.topic,
				status: "deliberating",
			}));
		},
	};
