import type {
	InitiateModeratorTurnInput,
	InitiateTopicTurnInput,
	TurnProposalDTO,
} from "@briom/app";
import { getModeratorId } from "@briom/libs/faker";
import { isServerError } from "@briom/libs/server-action";
import { useCallback, useMemo, useRef } from "react";

import { useInitiateModeratorTurnMutation } from "../../turn/mutations/use-initiate-moderator-turn.mutation";
import { useInitiateParticipantTurnMutation } from "../../turn/mutations/use-initiate-participant-turn.mutation";
import { useInitiateTopicTurnMutation } from "../../turn/mutations/use-initiate-topic-turn.mutation";
import type { Mentionee } from "../editor/helpers/mention-extractor";

import type { useDeliberationState } from "./use-deliberation-state";

export function useTurnSequencing(
	state: ReturnType<typeof useDeliberationState>,
) {
	const {
		fresh,
		invalidateTurnProposals,
		isParticipantActive,
		multiDeliberation,
		room,
		roomId,
		setHasAccepted,
		setIsSendingModerator,
		turns,
	} = state;

	const { mutateAsync: initiateTopic } = useInitiateTopicTurnMutation();
	const { mutateAsync: initiateModerator } = useInitiateModeratorTurnMutation();
	const { mutate: initiateParticipant } = useInitiateParticipantTurnMutation();

	const invalidateRef = useRef(invalidateTurnProposals);
	invalidateRef.current = invalidateTurnProposals;

	const releaseModeratorFlag = useCallback(() => {
		setIsSendingModerator(false);
		invalidateRef.current(roomId);
	}, [setIsSendingModerator, roomId]);

	const acceptProposal = useCallback(
		({ participantId, intent }: TurnProposalDTO) => {
			setHasAccepted(true);

			if (!multiDeliberation || isParticipantActive) return;
			initiateParticipant(
				{ roomId, participantId, intent },
				{ onSettled: () => invalidateRef.current(roomId) },
			);
		},
		[
			multiDeliberation,
			isParticipantActive,
			roomId,
			initiateParticipant,
			setHasAccepted,
		],
	);

	const lastActiveParticipantId = useMemo(() => {
		const lastTurn = turns.at(-1);
		if (lastTurn?.author.type === "participant") {
			return (
				room.participants.find(
					(p) => p.name === lastTurn.author.profile?.displayName,
				)?.id ?? null
			);
		}
		return null;
	}, [turns, room.participants]);

	const sequenceTurns = useCallback(
		async (content: string, mentionedParticipants: Mentionee[]) => {
			setIsSendingModerator(true);

			const firstParticipant = room.participants[0];
			const moderatorId = getModeratorId();
			const clientTurnId = crypto.randomUUID();

			const turnPayload: InitiateTopicTurnInput | InitiateModeratorTurnInput = {
				clientTurnId,
				content,
				moderatorId,
				roomId,
			};

			const handleError = () => {
				setIsSendingModerator(false);
				invalidateRef.current(roomId);
			};

			if (fresh) {
				const result = await initiateTopic(turnPayload);
				if (isServerError(result) || !firstParticipant) return handleError();

				const nextToRespond = multiDeliberation
					? (mentionedParticipants.find((m) => m.isPrimary) ?? firstParticipant)
					: firstParticipant;

				return initiateParticipant(
					{
						roomId,
						participantId: nextToRespond.id,
						intent: multiDeliberation ? "respond" : "direct",
					},
					{ onSettled: releaseModeratorFlag },
				);
			}

			if (!multiDeliberation) {
				const result = await initiateModerator(turnPayload);
				if (isServerError(result) || !firstParticipant) return handleError();

				return initiateParticipant(
					{ roomId, participantId: firstParticipant.id, intent: "direct" },
					{ onSettled: releaseModeratorFlag },
				);
			}

			const result = await initiateModerator(turnPayload);
			if (isServerError(result)) return handleError();

			const primaryMention = mentionedParticipants.find((m) => m.isPrimary);
			if (primaryMention) {
				return initiateParticipant(
					{ roomId, participantId: primaryMention.id, intent: "direct" },
					{ onSettled: releaseModeratorFlag },
				);
			}

			const candidates = room.participants.filter(
				(p) => p.id !== lastActiveParticipantId,
			);

			const pool = candidates.length > 0 ? candidates : room.participants;
			const randomParticipant = pool[Math.floor(Math.random() * pool.length)];

			if (randomParticipant) {
				return initiateParticipant(
					{ roomId, participantId: randomParticipant.id, intent: "respond" },
					{ onSettled: releaseModeratorFlag },
				);
			} else {
				handleError();
			}
		},
		[
			fresh,
			multiDeliberation,
			room.participants,
			roomId,
			lastActiveParticipantId,
			initiateModerator,
			initiateParticipant,
			initiateTopic,
			releaseModeratorFlag,
			setIsSendingModerator,
		],
	);

	return { acceptProposal, releaseModeratorFlag, sequenceTurns };
}
