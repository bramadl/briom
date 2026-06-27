import type { GetRoomDeliberationInput } from "@briom/app";
import { isServerError } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getRoomDeliberation, getRoomsOverview } from "../actions";

import { roomQueryKeys } from "./keys";

export const roomQueries = {
	getRoomDeliberation(input: Omit<GetRoomDeliberationInput, "moderatorId">) {
		return queryOptions({
			queryKey: roomQueryKeys.deliberation(input.roomId),
			queryFn: async () => {
				const result = await getRoomDeliberation(input);
				if (isServerError(result)) throw result.error;
				return result.data;
			},
		});
	},
	getRoomsOverview() {
		return queryOptions({
			queryKey: roomQueryKeys.rooms(),
			queryFn: async () => {
				const result = await getRoomsOverview();
				if (isServerError(result)) throw result.error;
				return result.data;
			},
		});
	},
};
