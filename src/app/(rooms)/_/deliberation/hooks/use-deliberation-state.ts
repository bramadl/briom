import { useEffect, useState } from "react";

import { useRoom } from "../../room/hooks/use-room";
import { useTurnProposals } from "../../turn/hooks/use-turn-proposals";
import {
	useIsAnyTurnStreaming,
	useStreamingTurnId,
} from "./use-streaming-turn";

export function useDeliberationState(roomId: string) {
	const { room, fresh, multiDeliberation, turns } = useRoom(roomId);
	const { proposals, invalidate: invalidateTurnProposals } =
		useTurnProposals(roomId);

	const [isSendingModerator, setIsSendingModerator] = useState(false);
	const [hasAccepted, setHasAccepted] = useState(false);

	const isConcluded = room.status === "concluded";
	const isParticipantActive = useIsAnyTurnStreaming();
	const isSequencing = isSendingModerator || isParticipantActive;

	const streamingTurnId = useStreamingTurnId();

	useEffect(() => {
		if (!isSequencing) setHasAccepted(false);
	}, [isSequencing]);

	return {
		fresh,
		hasAccepted,
		invalidateTurnProposals,
		isConcluded,
		isParticipantActive,
		isSendingModerator,
		isSequencing,
		multiDeliberation,
		proposals,
		room,
		roomId,
		setHasAccepted,
		setIsSendingModerator,
		streamingTurnId,
		turns,
	};
}
