import type { RoomParticipantJoinedPayload } from "@briom/app";

import type { SseEventHandler } from "../sse-types";

import { patchRoom } from "./helpers";

export const participantJoinedHandler: SseEventHandler<RoomParticipantJoinedPayload> =
	{
		handle: ({ data, queryClient, roomId }) => {
			patchRoom(queryClient, roomId, (room) => {
				if (room.participants.some((p) => p.id === data.participantId)) {
					return room;
				}
				return {
					...room,
					participants: [
						...room.participants,
						{
							id: data.participantId,
							model: "",
							name: "",
							provider: "",
							qualifiedModel: "",
						},
					],
				};
			});
		},
	};
