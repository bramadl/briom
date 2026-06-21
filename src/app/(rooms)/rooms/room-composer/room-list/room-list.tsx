"use client";

import { useRooms } from "@briom/rooms/hooks/store";
import { useParams } from "next/navigation";

import { RoomListEmpty } from "./room-list-empty";
import { RoomListItem } from "./room-list-item";

export function RoomList() {
	const { isEmpty, rooms } = useRooms();
	const { roomId } = useParams<{ roomId: string }>();

	if (isEmpty) return <RoomListEmpty />;
	return rooms.map((room) => (
		<RoomListItem isActive={room.id === roomId} key={room.id} room={room} />
	));
}
