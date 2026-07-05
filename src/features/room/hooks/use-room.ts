import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";

import { roomQueryOptions } from "../queries/query.options";

export function useRoom() {
	const { roomId } = useParams<{ roomId: string }>();
	if (!roomId) throw new Error("useRoom must be used in `rooms/{roomId}` page");

	const {
		data: {
			data: { room },
			metaData: { canAttachFile, canInviteParticipant },
		},
	} = useSuspenseQuery(roomQueryOptions.getRoom(roomId));

	if (!room) notFound();

	const isFrozen = room.state?.kind === "frozen";
	const isLocked = room.state?.kind === "locked";

	const isFresh = room.info.turns.length === 0;
	const isMultiDeliberation = room.info.participants.length > 1;

	const isConcluded = room.info.metadata.status === "concluded";
	const isDeliberating = room.info.metadata.status === "deliberating";
	const isForming = room.info.metadata.status === "forming";

	return {
		canAttachFile,
		canInviteParticipant,
		isConcluded,
		isDeliberating,
		isForming,
		isFresh,
		isFrozen,
		isLocked,
		isMultiDeliberation,
		room,
		roomId,
	};
}
