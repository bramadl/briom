import type {
	InitiateModeratorTurnInput,
	InitiateTopicTurnInput,
	TurnProposalDTO,
} from "@briom/app";
import { getModeratorId } from "@briom/libs/faker";
import { isServerError } from "@briom/libs/server-action";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { useRoom } from "../room/queries/data/use-room";
import { useTurnProposals } from "../turn/queries/data/use-turn-proposals";
import { useAbortTurnMutation } from "../turn/queries/mutations/use-abort-turn";
import { useInitiateModeratorTurnMutation } from "../turn/queries/mutations/use-initiate-moderator-turn-mutation";
import { useInitiateParticipantTurnMutation } from "../turn/queries/mutations/use-initiate-participant-turn-mutation";
import { useInitiateTopicTurnMutation } from "../turn/queries/mutations/use-initiate-topic-turn-mutation";

import type { Mentionee } from "./editor/helpers/mention-extractor";

export function useDeliberation() {
	const { roomId } = useParams<{ roomId: string }>();
	const { room, fresh, multiDeliberation, turns } = useRoom(roomId);
	const { proposals, invalidate: invalidateTurnProposals } =
		useTurnProposals(roomId);

	const [isSendingModerator, setIsSendingModerator] = useState(false);
	const isParticipantActive = useMemo(
		() => turns.some((t) => t.status === "pending" || t.status === "streaming"),
		[turns],
	);

	const isSequencing = isSendingModerator || isParticipantActive;
	const streamingTurnId = useMemo(
		() =>
			turns.findLast((t) => t.status === "streaming" || t.status === "pending")
				?.id ?? null,
		[turns],
	);

	const { mutateAsync: initiateTopic } = useInitiateTopicTurnMutation();
	const { mutateAsync: initiateModerator } = useInitiateModeratorTurnMutation();
	const { mutate: initiateParticipant } = useInitiateParticipantTurnMutation();
	const { mutate: abortTurn } = useAbortTurnMutation();

	const releaseModeratorFlag = useCallback(() => {
		setIsSendingModerator(false);
		invalidateTurnProposals(roomId);
	}, [invalidateTurnProposals, roomId]);

	const acceptProposal = useCallback(
		(proposal: TurnProposalDTO) => {
			if (!multiDeliberation || isSequencing) return;
			initiateParticipant(
				{
					roomId,
					participantId: proposal.participantId,
					intent: proposal.intent,
				},
				{ onSettled: () => invalidateTurnProposals(roomId) },
			);
		},
		[
			multiDeliberation,
			isSequencing,
			roomId,
			initiateParticipant,
			invalidateTurnProposals,
		],
	);

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

			if (fresh) {
				const result = await initiateTopic(turnPayload);
				if (isServerError(result) || !firstParticipant) {
					setIsSendingModerator(false);
					invalidateTurnProposals(roomId);
					return;
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
					{ onSettled: releaseModeratorFlag },
				);

				return;
			}

			if (!multiDeliberation) {
				const result = await initiateModerator(turnPayload);
				if (isServerError(result) || !firstParticipant) {
					setIsSendingModerator(false);
					invalidateTurnProposals(roomId);
					return;
				}

				initiateParticipant(
					{ roomId, participantId: firstParticipant.id, intent: "direct" },
					{ onSettled: releaseModeratorFlag },
				);

				return;
			}

			const result = await initiateModerator(turnPayload);
			if (isServerError(result)) {
				setIsSendingModerator(false);
				invalidateTurnProposals(roomId);
				return;
			}

			const primaryMention = mentionedParticipants.find((m) => m.isPrimary);
			if (primaryMention) {
				initiateParticipant(
					{ roomId, participantId: primaryMention.id, intent: "direct" },
					{ onSettled: releaseModeratorFlag },
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
						{ roomId, participantId: randomParticipant.id, intent: "respond" },
						{ onSettled: releaseModeratorFlag },
					);
				} else {
					setIsSendingModerator(false);
					invalidateTurnProposals(roomId);
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
			releaseModeratorFlag,
			invalidateTurnProposals,
		],
	);

	const abortStreaming = useCallback(() => {
		if (!streamingTurnId) return;
		abortTurn({ turnId: streamingTurnId });
	}, [abortTurn, streamingTurnId]);

	return {
		abortStreaming,
		acceptProposal,
		canAbort: isParticipantActive,
		fresh,
		isParticipantActive,
		isSendingModerator,
		isSequencing,
		multiDeliberation,
		participants: room.participants,
		proposals,
		room,
		sequenceTurns,
		turns,
	};
}
