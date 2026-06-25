import { useSuspenseQuery } from "@tanstack/react-query";

import { useRoomsInvalidation } from "../queries/invalidations/use-rooms.invalidation";
import { roomQueries } from "../queries/registry";

export function useRooms() {
	const { invalidate } = useRoomsInvalidation();
	const {
		data: { rooms },
	} = useSuspenseQuery(roomQueries.getRooms({}));

	const isEmpty = rooms.length === 0;
	return { invalidate, isEmpty, rooms };
}
