"use client";

import { useRooms } from "@briom/rooms/_/room/queries/data/use-rooms";
import { useParams } from "next/navigation";

import { RoomEmpty } from "./_/room-empty";
import { RoomHoverCard } from "./_/room-hover-card";

export function RoomList() {
	const { roomId } = useParams<{ roomId: string }>();
	const { rooms, isEmpty } = useRooms();

	if (isEmpty) return <RoomEmpty />;
	return rooms.map((room) => (
		<RoomHoverCard isActive={room.id === roomId} key={room.id} room={room} />
	));
}
