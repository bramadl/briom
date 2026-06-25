import type {
	InitiateModeratorTurnInput,
	InitiateTopicTurnInput,
	TurnProposalDTO,
} from "@briom/app";
import { getModeratorId } from "@briom/libs/faker";
import { isServerError } from "@briom/libs/server-action";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRoom } from "../../room/hooks/use-room";
import { useTurnProposals } from "../../turn/hooks/use-turn-proposals";
import { useAbortTurnMutation } from "../../turn/mutations/use-abort-turn.mutation";
import { useInitiateModeratorTurnMutation } from "../../turn/mutations/use-initiate-moderator-turn.mutation";
import { useInitiateParticipantTurnMutation } from "../../turn/mutations/use-initiate-participant-turn.mutation";
import { useInitiateTopicTurnMutation } from "../../turn/mutations/use-initiate-topic-turn.mutation";

import type { Mentionee } from "../editor/helpers/mention-extractor";

const actives = ["pending", "streaming"];

// ─── Derived State Hook ──────────────────────────────────────────────

function useDeliberationState(roomId: string) {
	const { room, fresh, multiDeliberation, turns } = useRoom(roomId);
	const { proposals, invalidate: invalidateTurnProposals } =
		useTurnProposals(roomId);

	const [isSendingModerator, setIsSendingModerator] = useState(false);
	const [hasAccepted, setHasAccepted] = useState(false);

	const isConcluded = room.status === "concluded";
	const isParticipantActive = turns.some((t) => actives.includes(t.status));
	const isSequencing = isSendingModerator || isParticipantActive;

	useEffect(() => {
		if (!isSequencing) setHasAccepted(false);
	}, [isSequencing]);

	const streamingTurnId = useMemo(() => {
		return (
			turns.findLast((t) => t.status === "streaming" || t.status === "pending")
				?.id ?? null
		);
	}, [turns]);

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

// ─── Turn Sequencing Hook ────────────────────────────────────────────

function useTurnSequencing(state: ReturnType<typeof useDeliberationState>) {
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

			// ───── Fresh room: topic turn ──────────────────────────────────────────
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

			// ───── Single deliberation: moderator + direct ──────────────────────
			if (!multiDeliberation) {
				const result = await initiateModerator(turnPayload);
				if (isServerError(result) || !firstParticipant) return handleError();

				return initiateParticipant(
					{ roomId, participantId: firstParticipant.id, intent: "direct" },
					{ onSettled: releaseModeratorFlag },
				);
			}

			// ───── Multi deliberation: moderator + smart response ────────────────
			const result = await initiateModerator(turnPayload);
			if (isServerError(result)) return handleError();

			const primaryMention = mentionedParticipants.find((m) => m.isPrimary);
			if (primaryMention) {
				return initiateParticipant(
					{ roomId, participantId: primaryMention.id, intent: "direct" },
					{ onSettled: releaseModeratorFlag },
				);
			}

			// Round-robin: exclude last active, fallback to all
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

// ─── Abort Hook ──────────────────────────────────────────────────────

function useAbortStreaming(streamingTurnId: string | null) {
	const { mutate: abortTurn } = useAbortTurnMutation();

	const abortStreaming = useCallback(() => {
		if (!streamingTurnId) return;
		abortTurn({ turnId: streamingTurnId });
	}, [abortTurn, streamingTurnId]);

	return abortStreaming;
}

// ─── Main Hook ───────────────────────────────────────────────────────

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
