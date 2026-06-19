"use client";

import type { RoomDTO } from "@briom/app";
import { useParams } from "next/navigation";

import { RoomListEmpty } from "./room-list-empty";
import { RoomListItem } from "./room-list-item";

interface RoomListProps {
	rooms: RoomDTO[];
}

export function RoomList({ rooms }: RoomListProps) {
	const { roomId } = useParams<{ roomId: string }>();

	if (rooms.length === 0) return <RoomListEmpty />;
	return rooms.map((room) => (
		<RoomListItem isActive={room.id === roomId} key={room.id} room={room} />
	));
}
