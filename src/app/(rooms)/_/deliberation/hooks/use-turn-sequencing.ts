import type { TurnProposalDTO } from "@briom/app";
import { isServerError } from "@briom/libs/server-action";
import { roomQueries } from "@briom/rooms/_/room/queries/registry";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { buildOptimisticParticipantTurn } from "../../turn/mutations/helpers/build-optimistic-participant-turn";
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

	const queryClient = useQueryClient();

	const { mutateAsync: initiateTopic } = useInitiateTopicTurnMutation();
	const { mutateAsync: initiateModerator } = useInitiateModeratorTurnMutation();
	const { mutate: initiateParticipant } = useInitiateParticipantTurnMutation();

	const invalidateRef = useRef(invalidateTurnProposals);
	invalidateRef.current = invalidateTurnProposals;

	const releaseModeratorFlag = useCallback(() => {
		setIsSendingModerator(false);
		invalidateRef.current(roomId);
	}, [setIsSendingModerator, roomId]);

	const injectOptimisticParticipant = useCallback(
		(participantId: string) => {
			const participant = room.participants.find((p) => p.id === participantId);
			if (!participant) return;

			const deliberationKey = roomQueries.getRoomDeliberation({
				roomId,
			}).queryKey;

			queryClient.setQueryData(deliberationKey, (old) => {
				if (!old?.room) return old;

				const alreadyExists = old.room.turns.some(
					(t) =>
						t.author.type === "participant" &&
						t.author.profile?.id === participantId &&
						(t.status === "pending" || t.status === "streaming"),
				);

				if (alreadyExists) return old;
				return {
					room: {
						...old.room,
						turns: [
							...old.room.turns,
							buildOptimisticParticipantTurn({ participant }),
						],
					},
				};
			});
		},
		[queryClient, roomId, room.participants],
	);

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
				room.participants.find((p) => p.id === lastTurn.author.profile?.id)
					?.id ?? null
			);
		}
		return null;
	}, [turns, room.participants]);

	const sequenceTurns = useCallback(
		async (content: string, mentionedParticipants: Mentionee[]) => {
			setIsSendingModerator(true);

			const firstParticipant = room.participants[0];
			const clientTurnId = crypto.randomUUID();
			const turnPayload = { clientTurnId, content, roomId };

			const handleError = () => {
				setIsSendingModerator(false);
				invalidateRef.current(roomId);
			};

			if (fresh) {
				const nextToRespond = multiDeliberation
					? (mentionedParticipants.find((m) => m.isPrimary) ?? firstParticipant)
					: firstParticipant;

				if (nextToRespond) injectOptimisticParticipant(nextToRespond.id);

				const result = await initiateTopic(turnPayload);
				if (isServerError(result) || !firstParticipant) {
					invalidateRef.current(roomId);
					return handleError();
				}

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
				if (firstParticipant) injectOptimisticParticipant(firstParticipant.id);

				const result = await initiateModerator(turnPayload);
				if (isServerError(result) || !firstParticipant) {
					invalidateRef.current(roomId);
					return handleError();
				}

				return initiateParticipant(
					{ roomId, participantId: firstParticipant.id, intent: "respond" },
					{ onSettled: releaseModeratorFlag },
				);
			}

			const primaryMention = mentionedParticipants.find((m) => m.isPrimary);
			const candidates = room.participants.filter(
				(p) => p.id !== lastActiveParticipantId,
			);

			const pool = candidates.length > 0 ? candidates : room.participants;
			const randomParticipant = pool[Math.floor(Math.random() * pool.length)];

			const nextResponder = primaryMention ?? randomParticipant ?? null;
			if (nextResponder) injectOptimisticParticipant(nextResponder.id);

			const result = await initiateModerator(turnPayload);
			if (isServerError(result)) {
				invalidateRef.current(roomId);
				return handleError();
			}

			if (!nextResponder) return handleError();
			return initiateParticipant(
				{
					roomId,
					participantId: nextResponder.id,
					intent: primaryMention ? "direct" : "respond",
				},
				{ onSettled: releaseModeratorFlag },
			);
		},
		[
			fresh,
			multiDeliberation,
			room.participants,
			roomId,
			lastActiveParticipantId,
			injectOptimisticParticipant,
			initiateModerator,
			initiateParticipant,
			initiateTopic,
			releaseModeratorFlag,
			setIsSendingModerator,
		],
	);

	return { acceptProposal, releaseModeratorFlag, sequenceTurns };
}
