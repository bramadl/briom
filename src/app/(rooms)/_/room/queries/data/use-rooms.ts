import { useSuspenseQuery } from "@tanstack/react-query";

import { useRoomsInvalidation } from "../invalidations/use-rooms-invalidation";
import { roomQueries } from "../registry";

export function useRooms() {
	const { invalidate } = useRoomsInvalidation();
	const {
		data: { rooms },
	} = useSuspenseQuery(roomQueries.getRooms({}));

	const isEmpty = rooms.length === 0;
	return { invalidate, isEmpty, rooms };
}
