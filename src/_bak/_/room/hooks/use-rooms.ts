import { useSuspenseQuery } from "@tanstack/react-query";

import { ROOM_SETTING } from "../config/setting";
import { useRoomsInvalidation } from "../queries/invalidations/use-rooms.invalidation";
import { roomQueries } from "../queries/registry";

export function useRooms() {
	const { invalidate } = useRoomsInvalidation();
	const {
		data: { rooms },
	} = useSuspenseQuery(roomQueries.getRoomsOverview());

	const isEmpty = rooms.length === 0;
	const isMaxReached = rooms.length >= ROOM_SETTING.MAXIMUM_ROOMS;

	return { invalidate, isEmpty, isMaxReached, rooms };
}
