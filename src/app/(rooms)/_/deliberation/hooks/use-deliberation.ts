import { useParams } from "next/navigation";

import { useAbortStreaming } from "./use-abort-streaming";
import { useDeliberationState } from "./use-deliberation-state";
import { useTurnSequencing } from "./use-turn-sequencing";

export function useDeliberation() {
	const { roomId } = useParams<{ roomId: string }>();
	const state = useDeliberationState(roomId);

	const { acceptProposal, sequenceTurns } = useTurnSequencing(state);
	const abortStreaming = useAbortStreaming(state.streamingTurnId);

	const canAcceptProposal =
		!state.isConcluded &&
		!state.isSequencing &&
		state.proposals.length > 0 &&
		!state.hasAccepted;

	return {
		abortStreaming,
		acceptProposal,
		canAbort: state.isParticipantActive,
		canAcceptProposal,
		fresh: state.fresh,
		isConcluded: state.isConcluded,
		isParticipantActive: state.isParticipantActive,
		isSendingModerator: state.isSendingModerator,
		isSequencing: state.isSequencing,
		multiDeliberation: state.multiDeliberation,
		participants: state.room.participants,
		proposals: state.proposals,
		room: state.room,
		sequenceTurns,
		turns: state.turns,
	};
}
