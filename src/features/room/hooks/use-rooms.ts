import { useSuspenseQuery } from "@tanstack/react-query";

import { roomQueryOptions } from "../queries/query.options";

export function useRooms() {
	const {
		data: {
			data: { rooms },
			metaData: { canOpenMoreRoom, quotaLeft, total },
		},
	} = useSuspenseQuery(roomQueryOptions.getRooms());

	const isEmpty = rooms.length === 0;

	return {
		canOpenMoreRoom,
		isEmpty,
		quotaLeft,
		rooms,
		total,
	};
}
