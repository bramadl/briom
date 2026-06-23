"use client";

import type { RoomDTO } from "@briom/app";
import { isServerError } from "@briom/libs/server-action";

import { useRoomsQuery } from "../queries";
import { useRoomsInvalidation } from "../queries/invalidations";

export function useRooms() {
	const { invalidate } = useRoomsInvalidation();
	const { data } = useRoomsQuery();

	let rooms: RoomDTO[] = [];
	if (!isServerError(data)) rooms = data.data.rooms;

	const isEmpty = rooms.length === 0;

	return { invalidate, isEmpty, rooms };
}
