import type {
	GetParticipantModelsInput,
	GetRoomInput,
	GetRoomsInput,
} from "@briom/app";
import { queryOptions } from "@tanstack/react-query";

import { getParticipantModels, getRoom, getRooms } from "../room.actions";
import { type QueryKeys, queryKeys } from "./keys";

export interface RoomQueryFnData {
	GetRoom: Awaited<ReturnType<typeof getRoom>>;
	GetRooms: Awaited<ReturnType<typeof getRooms>>;
	ParticipantModels: Awaited<ReturnType<typeof getParticipantModels>>;
}

export const roomQueries = {
	getParticipantModels(input: GetParticipantModelsInput) {
		return queryOptions<
			RoomQueryFnData["ParticipantModels"],
			Error,
			RoomQueryFnData["ParticipantModels"],
			QueryKeys["Rooms"]["ParticipantModels"]
		>({
			queryFn: async () => getParticipantModels(input),
			queryKey: queryKeys.rooms.participantModels(),
		});
	},
	getRoom(input: GetRoomInput) {
		return queryOptions<
			RoomQueryFnData["GetRoom"],
			Error,
			RoomQueryFnData["GetRoom"],
			QueryKeys["Rooms"]["Get"]
		>({
			queryFn: async () => getRoom(input),
			queryKey: queryKeys.rooms.get(input.roomId),
		});
	},
	getRooms(input: GetRoomsInput) {
		return queryOptions<
			RoomQueryFnData["GetRooms"],
			Error,
			RoomQueryFnData["GetRooms"],
			QueryKeys["Rooms"]["List"]
		>({
			queryFn: async () => getRooms(input),
			queryKey: queryKeys.rooms.list(),
		});
	},
};
