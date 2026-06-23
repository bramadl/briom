import { useTurnsInvalidation } from "@briom/rooms/_/turn/queries/invalidations/use-turns-invalidation";
import { turnQueries } from "@briom/rooms/_/turn/queries/registry";
import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { useRoomInvalidation } from "../invalidations/use-room-invalidation";
import { roomQueries } from "../registry";

export function useRoom(roomId: string) {
	const { invalidate: invalidateRoom } = useRoomInvalidation();
	const { invalidate: invalidateTurns } = useTurnsInvalidation();

	const {
		data: { room },
	} = useSuspenseQuery(roomQueries.getRoom({ roomId }));
	if (!room) notFound();

	const {
		data: { turns },
	} = useSuspenseQuery(turnQueries.getTurns({ roomId }));

	const fresh = room ? room.status === "forming" : false;
	const multiDeliberation = room ? room.participants.length > 1 : false;
	const streaming = turns.some((t) => t.status === "streaming");

	const invalidate = () => {
		invalidateRoom(roomId);
		invalidateTurns(roomId);
	};

	return {
		fresh,
		multiDeliberation,
		streaming,
		invalidate,
		invalidateRoom: () => invalidateRoom(roomId),
		invalidateTurns: () => invalidateTurns(roomId),
		room,
		roomId,
		turns,
	};
}
