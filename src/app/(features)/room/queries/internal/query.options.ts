import { unwrap } from "@briom/libs/server-action";
import { queryOptions } from "@tanstack/react-query";

import { getRoom } from "../../actions/get-room.action";
import { getRooms } from "../../actions/get-rooms.action";
import { roomQueryKeys } from "./query.keys";

export const roomQueryOptions = {
	getRooms: () => {
		return queryOptions({
			queryKey: roomQueryKeys.getRooms(),
			queryFn: async () => unwrap(await getRooms()),
			staleTime: Infinity,
		});
	},

	getRoom: (id: string) => {
		return queryOptions({
			queryKey: roomQueryKeys.getRoom(id),
			queryFn: async () => unwrap(await getRoom({ roomId: id })),
			staleTime: Infinity,
		});
	},
};
