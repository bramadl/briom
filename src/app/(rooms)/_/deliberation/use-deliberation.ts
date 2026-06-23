import type {
	InitiateModeratorTurnInput,
	InitiateTopicTurnInput,
} from "@briom/app";
import { getModeratorId } from "@briom/libs/faker";
import { isServerError } from "@briom/libs/server-action";
import { useParams } from "next/navigation";
import { useCallback } from "react";

import { useRoom } from "../room/queries/data/use-room";
import { useInitiateModeratorTurnMutation } from "../turn/queries/mutations/use-initiate-moderator-turn-mutation";
import { useInitiateParticipantTurnMutation } from "../turn/queries/mutations/use-initiate-participant-turn-mutation";
import { useInitiateTopicTurnMutation } from "../turn/queries/mutations/use-initiate-topic-turn-mutation";

import type { Mentionee } from "./editor/helpers/mention-extractor";

export function useDeliberation() {
	const { roomId } = useParams<{ roomId: string }>();
	const { room, fresh, multiDeliberation, streaming, turns } = useRoom(roomId);

	const { mutateAsync: initiateTopic } = useInitiateTopicTurnMutation();
	const { mutateAsync: initiateModerator } = useInitiateModeratorTurnMutation();
	const { mutate: initiateParticipant } = useInitiateParticipantTurnMutation();

	const sequenceTurns = useCallback(
		async (content: string, mentionedParticipants: Mentionee[]) => {
			const firstParticipant = room.participants[0];
			const moderatorId = getModeratorId();
			const clientTurnId = crypto.randomUUID();

			const turnPayload: InitiateTopicTurnInput | InitiateModeratorTurnInput = {
				clientTurnId,
				content,
				moderatorId,
				roomId,
			};

			if (fresh) {
				const result = await initiateTopic(turnPayload);
				if (isServerError(result) || !firstParticipant) return;

				const nextToRespond = multiDeliberation
					? (mentionedParticipants.find((m) => m.isPrimary) ?? firstParticipant)
					: firstParticipant;

				initiateParticipant({
					roomId,
					participantId: nextToRespond.id,
					intent: multiDeliberation ? "respond" : "direct",
				});

				return;
			}

			if (!multiDeliberation) {
				const result = await initiateModerator(turnPayload);
				if (isServerError(result) || !firstParticipant) return;

				initiateParticipant({
					roomId,
					participantId: firstParticipant.id,
					intent: "direct",
				});
			}
		},
		[
			fresh,
			multiDeliberation,
			room.participants,
			roomId,
			initiateTopic,
			initiateModerator,
			initiateParticipant,
		],
	);

	return {
		fresh,
		multiDeliberation,
		streaming,
		room,
		participants: room.participants,
		turns,
		sequenceTurns,
	};
}
