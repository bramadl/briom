"use client";

import type { RoomDTO } from "@briom/app";
import { useParams } from "next/navigation";

import { RoomEmpty } from "./_/room-empty";
import { RoomHoverCard } from "./_/room-hover-card";

interface RoomListProps {
	rooms: RoomDTO[];
}

export function RoomList({ rooms }: RoomListProps) {
	const { roomId } = useParams<{ roomId: string }>();

	if (rooms.length === 0) return <RoomEmpty />;
	return rooms.map((room) => (
		<RoomHoverCard isActive={room.id === roomId} key={room.id} room={room} />
	));
}
