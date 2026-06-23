import type { GetRoomInput, GetRoomsInput } from "@briom/app";
import { isServerError } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getRoom, getRooms } from "../actions";

import { roomQueryKeys } from "./keys";

export const roomQueries = {
	getRoom(input: GetRoomInput) {
		return queryOptions({
			queryKey: roomQueryKeys.room(input.roomId),
			queryFn: async () => {
				const result = await getRoom(input);
				if (isServerError(result)) throw result.error;
				return result.data;
			},
		});
	},
	getRooms(input: GetRoomsInput) {
		return queryOptions({
			queryKey: roomQueryKeys.rooms(),
			queryFn: async () => {
				const result = await getRooms(input);
				if (isServerError(result)) throw result.error;
				return result.data;
			},
		});
	},
};
