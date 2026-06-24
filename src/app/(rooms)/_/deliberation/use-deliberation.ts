import type {
	InitiateModeratorTurnInput,
	InitiateTopicTurnInput,
	TurnProposalDTO,
} from "@briom/app";
import { getModeratorId } from "@briom/libs/faker";
import { isServerError } from "@briom/libs/server-action";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

import { useRoom } from "../room/queries/data/use-room";
import { useTurnProposals } from "../turn/queries/data/use-turn-proposals";
import { useInitiateModeratorTurnMutation } from "../turn/queries/mutations/use-initiate-moderator-turn-mutation";
import { useInitiateParticipantTurnMutation } from "../turn/queries/mutations/use-initiate-participant-turn-mutation";
import { useInitiateTopicTurnMutation } from "../turn/queries/mutations/use-initiate-topic-turn-mutation";

import type { Mentionee } from "./editor/helpers/mention-extractor";

export function useDeliberation() {
	const { roomId } = useParams<{ roomId: string }>();
	const { room, fresh, multiDeliberation, turns } = useRoom(roomId);
	const { proposals, invalidate: invalidateTurnProposals } =
		useTurnProposals(roomId);

	const [isSequencing, setIsSequencing] = useState<boolean>(false);

	const { mutateAsync: initiateTopic } = useInitiateTopicTurnMutation();
	const { mutateAsync: initiateModerator } = useInitiateModeratorTurnMutation();
	const { mutate: initiateParticipant } = useInitiateParticipantTurnMutation();

	const releaseSequence = useCallback(() => {
		invalidateTurnProposals(roomId);
		setIsSequencing(false);
	}, [invalidateTurnProposals, roomId]);

	const acceptProposal = useCallback(
		(proposal: TurnProposalDTO) => {
			if (!multiDeliberation || isSequencing) return;

			setIsSequencing(true);
			initiateParticipant(
				{
					roomId,
					participantId: proposal.participantId,
					intent: proposal.intent,
				},
				{
					onSettled: () => releaseSequence(),
					onError: () => releaseSequence(),
				},
			);
		},
		[
			isSequencing,
			multiDeliberation,
			roomId,
			initiateParticipant,
			releaseSequence,
		],
	);

	const sequenceTurns = useCallback(
		async (content: string, mentionedParticipants: Mentionee[]) => {
			setIsSequencing(true);

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
				if (isServerError(result) || !firstParticipant) {
					return releaseSequence();
				}

				const nextToRespond = multiDeliberation
					? (mentionedParticipants.find((m) => m.isPrimary) ?? firstParticipant)
					: firstParticipant;

				initiateParticipant(
					{
						roomId,
						participantId: nextToRespond.id,
						intent: multiDeliberation ? "respond" : "direct",
					},
					{ onSettled: () => releaseSequence() },
				);

				return;
			}

			if (!multiDeliberation) {
				const result = await initiateModerator(turnPayload);
				if (isServerError(result) || !firstParticipant) {
					return releaseSequence();
				}

				initiateParticipant(
					{
						roomId,
						participantId: firstParticipant.id,
						intent: "direct",
					},
					{ onSettled: () => releaseSequence() },
				);

				return;
			}

			const result = await initiateModerator(turnPayload);
			if (isServerError(result)) return releaseSequence();

			const primaryMention = mentionedParticipants.find((m) => m.isPrimary);
			if (primaryMention) {
				initiateParticipant(
					{
						roomId,
						participantId: primaryMention.id,
						intent: "direct",
					},
					{ onSettled: () => releaseSequence() },
				);
			} else {
				const lastTurn = turns.at(-1);
				const lastActiveParticipantId =
					lastTurn?.author.type === "participant"
						? lastTurn.author.participantId
						: null;

				const candidates = room.participants.filter(
					(p) => p.id !== lastActiveParticipantId,
				);

				const pool = candidates.length > 0 ? candidates : room.participants;
				const randomParticipant = pool[Math.floor(Math.random() * pool.length)];

				if (randomParticipant) {
					initiateParticipant(
						{
							roomId,
							participantId: randomParticipant.id,
							intent: "respond",
						},
						{ onSettled: () => releaseSequence() },
					);
				}
			}
		},
		[
			fresh,
			multiDeliberation,
			room.participants,
			roomId,
			turns,
			initiateModerator,
			initiateParticipant,
			initiateTopic,
			releaseSequence,
		],
	);

	return {
		fresh,
		multiDeliberation,
		streaming: isSequencing,
		room,
		participants: room.participants,
		proposals,
		turns,
		sequenceTurns,
		acceptProposal,
	};
}
