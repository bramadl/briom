import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";

import { roomQueryOptions } from "../queries/internal/query.options";

export function useRoom() {
	const { roomId } = useParams<{ roomId: string }>();
	if (!roomId) throw new Error("useRoom must be used in `rooms/{roomId}` page");

	const {
		data: {
			data: { room },
		},
	} = useSuspenseQuery(roomQueryOptions.getRoom(roomId));

	if (!room) notFound();
	return { room, roomId };
}
