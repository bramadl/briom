import { useSuspenseQuery } from "@tanstack/react-query";

import { roomQueryOptions } from "./internal/query.options";

export function useRooms() {
	const { data } = useSuspenseQuery(roomQueryOptions.getRooms());

	const {
		data: { rooms },
		metaData: { canOpenMoreRoom, quotaLeft, total },
	} = data;

	const isEmpty = rooms.length === 0;

	return {
		canOpenMoreRoom,
		isEmpty,
		quotaLeft,
		rooms,
		total,
	};
}
