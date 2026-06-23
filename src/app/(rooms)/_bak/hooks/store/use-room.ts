import { isServerError } from "@briom/libs/server-action";
import { useParams } from "next/navigation";

import { useRoomQuery, useTurnsQuery } from "../queries";
import {
	useRoomInvalidation,
	useTurnsInvalidation,
} from "../queries/invalidations";

export function useRoom() {
	const { roomId } = useParams<{ roomId: string }>();
	if (!roomId) {
		throw new Error("useRoom must be used in `rooms/[roomId]` route!");
	}

	const { invalidate: invalidateRoom } = useRoomInvalidation();
	const { invalidate: invalidateTurns } = useTurnsInvalidation();

	const { data: roomData } = useRoomQuery(roomId);
	const { data: turnsData } = useTurnsQuery(roomId);

	if (isServerError(roomData)) throw roomData.error;
	if (isServerError(turnsData)) throw turnsData.error;

	const { turns } = turnsData.data;
	const { room } = roomData.data;
	if (!room) throw new Error("No room");

	const isFreshRoom = room.status === "forming";
	const isMultiDeliberationRoom = room.participants.length > 1;
	const isStreaming = turns.some((t) => t.status === "streaming");

	const invalidate = () => {
		invalidateRoom(roomId);
		invalidateTurns(roomId);
	};

	return {
		isFreshRoom,
		isMultiDeliberationRoom,
		isStreaming,
		invalidate,
		invalidateRoom: () => invalidateRoom(roomId),
		invalidateTurns: () => invalidateTurns(roomId),
		room,
		roomId,
		turns,
	};
}
