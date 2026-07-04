import { queryOptions } from "@tanstack/react-query";

import { getRooms } from "../../actions/get-rooms.action";
import { roomQueryKeys } from "./query.keys";

export const roomQueryOptions = {
	getRooms: () => {
		return queryOptions({
			queryKey: roomQueryKeys.getRooms(),
			queryFn: getRooms,
			staleTime: Infinity,
		});
	},
};
