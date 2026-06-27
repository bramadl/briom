import type { TurnProposalDTO } from "@briom/app";
import { isServerError } from "@briom/libs/server-action";
import { roomQueries } from "@briom/rooms/_/room/queries/registry";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";

import { buildOptimisticModeratorTurn } from "../../turn/mutations/helpers/build-optimistic-moderator-turn";
import { buildOptimisticParticipantTurn } from "../../turn/mutations/helpers/build-optimistic-participant-turn";
import { useInitiateModeratorTurnMutation } from "../../turn/mutations/use-initiate-moderator-turn.mutation";
import { useInitiateParticipantTurnMutation } from "../../turn/mutations/use-initiate-participant-turn.mutation";
import { useInitiateTopicTurnMutation } from "../../turn/mutations/use-initiate-topic-turn.mutation";
import type { Mentionee } from "../editor/helpers/mention-extractor";

import type { useDeliberationState } from "./use-deliberation-state";

export function useTurnSequencing(
	state: ReturnType<typeof useDeliberationState>,
) {
	const queryClient = useQueryClient();
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

	// ─── Helpers ────────────────────────────────────────────────────────────────

	const releaseModeratorFlag = useCallback(() => {
		setIsSendingModerator(false);
		invalidateRef.current(roomId);
	}, [setIsSendingModerator, roomId]);

	/**
	 * Injects an optimistic moderator + participant turn pair into the query
	 * cache before any server round-trip, so the UI renders both immediately
	 * with no visible gap. The moderator turn's `clientTurnId` acts as an
	 * idempotency key — `onMutate` in `buildModeratorTurnMutation` skips the
	 * inject if it finds the id already present.
	 */
	const injectOptimisticPair = useCallback(
		(clientTurnId: string, content: string, participantId: string) => {
			const participant = room.participants.find((p) => p.id === participantId);
			if (!participant) return;

			queryClient.setQueryData(
				roomQueries.getRoomDeliberation({ roomId }).queryKey,
				(old) => {
					if (!old?.room) return old;
					return {
						room: {
							...old.room,
							turns: [
								...old.room.turns,
								buildOptimisticModeratorTurn({ clientTurnId, content }),
								buildOptimisticParticipantTurn({ participant }),
							],
						},
					};
				},
			);
		},
		[queryClient, roomId, room.participants],
	);

	/**
	 * Picks the next participant to respond in a multi-deliberation room.
	 * Prefers an explicit @mention; falls back to a participant who wasn't
	 * the last to speak, or any participant if everyone has spoken equally.
	 */
	const lastActiveParticipantId = useMemo(() => {
		const lastParticipantTurn = [...turns]
			.reverse()
			.find((t) => t.author.type === "participant");

		return (
			room.participants.find(
				(p) => p.id === lastParticipantTurn?.author.profile?.id,
			)?.id ?? null
		);
	}, [turns, room.participants]);

	const pickNextResponder = useCallback(
		(mentionedParticipants: Mentionee[]) => {
			const primaryMention = mentionedParticipants.find((m) => m.isPrimary);
			if (primaryMention) return primaryMention;

			const candidates = room.participants.filter(
				(p) => p.id !== lastActiveParticipantId,
			);
			const pool = candidates.length > 0 ? candidates : room.participants;
			return pool[Math.floor(Math.random() * pool.length)] ?? null;
		},
		[room.participants, lastActiveParticipantId],
	);

	// ─── Sequencing branches ────────────────────────────────────────────────────

	type TurnPayload = { clientTurnId: string; content: string; roomId: string };

	/**
	 * Fresh room: no prior turns exist. Uses `initiateTopic` (instead of
	 * `initiateModerator`) which also starts the deliberation on the backend.
	 */
	const sequenceFreshTurn = useCallback(
		async (
			payload: TurnPayload,
			mentionedParticipants: Mentionee[],
			onError: () => void,
		) => {
			const nextToRespond = multiDeliberation
				? (mentionedParticipants.find((m) => m.isPrimary) ??
					room.participants[0])
				: room.participants[0];

			if (nextToRespond) {
				injectOptimisticPair(
					payload.clientTurnId,
					payload.content,
					nextToRespond.id,
				);
			}

			const result = await initiateTopic(payload);
			if (isServerError(result) || !room.participants[0]) return onError();

			initiateParticipant(
				{
					roomId,
					participantId: nextToRespond.id,
					intent: multiDeliberation ? "respond" : "direct",
				},
				{ onSettled: releaseModeratorFlag },
			);
		},
		[
			multiDeliberation,
			room.participants,
			roomId,
			injectOptimisticPair,
			initiateTopic,
			initiateParticipant,
			releaseModeratorFlag,
		],
	);

	/**
	 * Single-deliberation room: always responds with the first (only)
	 * participant, no mention resolution needed.
	 */
	const sequenceSingleDeliberationTurn = useCallback(
		async (payload: TurnPayload, onError: () => void) => {
			const [firstParticipant] = room.participants;

			if (firstParticipant) {
				injectOptimisticPair(
					payload.clientTurnId,
					payload.content,
					firstParticipant.id,
				);
			}

			const result = await initiateModerator(payload);
			if (isServerError(result) || !firstParticipant) return onError();

			initiateParticipant(
				{ roomId, participantId: firstParticipant.id, intent: "respond" },
				{ onSettled: releaseModeratorFlag },
			);
		},
		[
			room.participants,
			roomId,
			injectOptimisticPair,
			initiateModerator,
			initiateParticipant,
			releaseModeratorFlag,
		],
	);

	/**
	 * Multi-deliberation room: resolves next responder from @mentions or
	 * round-robin, then sequences the turn.
	 */
	const sequenceMultiDeliberationTurn = useCallback(
		async (
			payload: TurnPayload,
			mentionedParticipants: Mentionee[],
			onError: () => void,
		) => {
			const nextResponder = pickNextResponder(mentionedParticipants);

			if (nextResponder) {
				injectOptimisticPair(
					payload.clientTurnId,
					payload.content,
					nextResponder.id,
				);
			}

			const result = await initiateModerator(payload);
			if (isServerError(result)) return onError();
			if (!nextResponder) return onError();

			const isPrimaryMention = mentionedParticipants.some((m) => m.isPrimary);
			initiateParticipant(
				{
					roomId,
					participantId: nextResponder.id,
					intent: isPrimaryMention ? "direct" : "respond",
				},
				{ onSettled: releaseModeratorFlag },
			);
		},
		[
			roomId,
			pickNextResponder,
			injectOptimisticPair,
			initiateModerator,
			initiateParticipant,
			releaseModeratorFlag,
		],
	);

	// ─── Public API ─────────────────────────────────────────────────────────────

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

	const sequenceTurns = useCallback(
		async (content: string, mentionedParticipants: Mentionee[]) => {
			setIsSendingModerator(true);

			const clientTurnId = crypto.randomUUID();
			const payload = { clientTurnId, content, roomId };

			const handleError = () => {
				setIsSendingModerator(false);
				invalidateRef.current(roomId);
			};

			if (fresh) {
				return sequenceFreshTurn(payload, mentionedParticipants, handleError);
			} else if (!multiDeliberation) {
				return sequenceSingleDeliberationTurn(payload, handleError);
			} else {
				return sequenceMultiDeliberationTurn(
					payload,
					mentionedParticipants,
					handleError,
				);
			}
		},
		[
			fresh,
			multiDeliberation,
			roomId,
			setIsSendingModerator,
			sequenceFreshTurn,
			sequenceSingleDeliberationTurn,
			sequenceMultiDeliberationTurn,
		],
	);

	return { acceptProposal, releaseModeratorFlag, sequenceTurns };
}
