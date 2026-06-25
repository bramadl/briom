import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { useRoomInvalidation } from "../queries/invalidations/use-room.invalidation";
import { roomQueries } from "../queries/registry";

export function useRoom(roomId: string) {
	const { invalidate: invalidateRoom } = useRoomInvalidation();

	const {
		data: { room },
	} = useSuspenseQuery(roomQueries.getRoomDeliberation({ roomId }));
	if (!room) notFound();

	const fresh = room.status === "forming";
	const multiDeliberation = room.participants.length > 1;
	const streaming = room.turns.some((t) => t.status === "streaming");

	const invalidate = () => {
		invalidateRoom(roomId);
	};

	return {
		fresh,
		multiDeliberation,
		streaming,
		invalidate,
		room,
		roomId,
		turns: room.turns,
	};
}
