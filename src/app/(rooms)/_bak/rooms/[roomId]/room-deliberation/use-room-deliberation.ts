import { useIsHydrated } from "@briom/hooks/is-hydrated";
import { getModeratorId } from "@briom/libs/faker";
import { isServerError } from "@briom/libs/server-action";
import { useRoom } from "@briom/rooms/_bak/hooks/store/use-room";
import { useCallback, useMemo } from "react";
import { useInitiateModeratorTurnMutation } from "../../../hooks/mutations/use-initiate-moderator-turn-mutation";
import { useInitiateParticipantTurnMutation } from "../../../hooks/mutations/use-initiate-participant-turn-mutation";
import { useInitiateTopicTurnMutation } from "../../../hooks/mutations/use-initiate-topic-turn-mutation";
import type { Mentionee } from "./moderator-input/editor";
import { useRoomSSE } from "./room-sse/use-room-sse";

export function useRoomDeliberation() {
	const ready = useIsHydrated();
	const {
		room,
		isFreshRoom,
		isMultiDeliberationRoom,
		isStreaming,
		roomId,
		turns,
	} = useRoom();

	const moderatorHint = useMemo(() => {
		return isMultiDeliberationRoom
			? "Introduce the next idea, or @ mention someone to dive deeper..."
			: "Bring a question, an idea, or a dilemma you're working through...";
	}, [isMultiDeliberationRoom]);

	const { mutate: initiateTopicTurn } = useInitiateTopicTurnMutation();
	const { mutate: initiateModeratorTurn } = useInitiateModeratorTurnMutation();
	const { mutate: initiateParticipantTurn } =
		useInitiateParticipantTurnMutation();

	const sequenceTurns = useCallback(
		async (content: string, _mentionees: Mentionee[]) => {
			const firstParticipant = room.participants[0];
			if (isFreshRoom) {
				initiateTopicTurn(
					{
						roomId,
						moderatorId: getModeratorId(),
						content,
						clientTurnId: crypto.randomUUID(), // +
					},
					{
						onSuccess: (result) => {
							if (isServerError(result) || !firstParticipant) return;
							initiateParticipantTurn({
								roomId,
								participantId: firstParticipant.id,
								intent: "direct",
							});
						},
					},
				);
			} else {
				initiateModeratorTurn(
					{
						content,
						moderatorId: getModeratorId(),
						roomId,
						clientTurnId: crypto.randomUUID(), // +
					},
					{
						onSuccess: (result) => {
							if (isServerError(result)) return;
							if (!isMultiDeliberationRoom) {
								initiateParticipantTurn({
									roomId,
									participantId: firstParticipant.id,
									intent: "respond",
								});
							}
						},
					},
				);
			}
		},
		[
			isFreshRoom,
			isMultiDeliberationRoom,
			room.participants,
			roomId,
			initiateModeratorTurn,
			initiateParticipantTurn,
			initiateTopicTurn,
		],
	);

	useRoomSSE({ roomId });

	return {
		isFreshRoom,
		isMultiDeliberationRoom,
		isStreaming,
		room,
		participants: room.participants,
		turns,
		moderatorHint,
		ready,
		sequenceTurns,
	};
}
