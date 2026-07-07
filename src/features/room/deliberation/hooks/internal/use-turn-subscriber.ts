"use client";

import type { RoomTurnDTO } from "@briom/core/app";
import { turnChannel } from "@briom/inngest/channels/turn.channel";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { getTurnRealtimeToken } from "@briom/room/turns/actions/get-turn-realtime.action";
// import { turnQueryOptions } from "@briom/room/turns/queries/query.options";
import { turnStreamActions } from "@briom/room/turns/store/turn-stream.store";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "inngest/react";
import { useEffect } from "react";

const TURN_TOPICS = [
	"initiated",
	"streamStarted",
	"tokenAccumulated",
	"settled",
	"failed",
	"abandoned",
] as const;

/**
 * @description
 * Resume-on-mount: covers reconnect while BE is mid-stream (hard
 * refresh, HMR, navigate-away-and-back). Without this, the store
 * comes up as `activeTurnId: null` and every subsequent
 * `tokenAccumulated`/`settled` for that turn gets silently dropped
 * by the `activeTurnId !== turnId` guards — the user is stuck
 * looking at whatever partial content the DTO had at mount, forever,
 * until some unrelated event forces a refetch. Runs once per mount;
 * intentionally NOT re-run if `initialTurns` changes later in this
 * hook's lifetime (that's what the realtime messages below are for).
 */
function useResumeStream(
	roomId: string,
	initialTurns: Pick<RoomTurnDTO, "id" | "status" | "content">[],
) {
	const queryClient = useQueryClient();
	const roomKey = roomQueryOptions.getRoom(roomId).queryKey;

	// biome-ignore lint/correctness/useExhaustiveDependencies: deliberately mount-only, see comment above.
	useEffect(() => {
		const streamingTurn = initialTurns.find((t) => t.status === "streaming");
		const pendingTurn = initialTurns.find((t) => t.status === "pending");

		if (streamingTurn) {
			turnStreamActions.resumeStreaming(
				streamingTurn.id,
				streamingTurn.content,
			);
		} else if (pendingTurn) {
			turnStreamActions.claimTurn(pendingTurn.id);
		}

		if (streamingTurn || pendingTurn) {
			queryClient.invalidateQueries({ queryKey: roomKey, exact: true });
		}
	}, []);
}

export function useTurnSubscriber(params: {
	roomId: string;
	initialTurns: Pick<RoomTurnDTO, "id" | "status" | "content">[];
}) {
	const { roomId, initialTurns } = params;

	// const queryClient = useQueryClient();
	// const roomKey = roomQueryOptions.getRoom(roomId).queryKey;
	// const proposalsKey = turnQueryOptions.getProposals(roomId).queryKey;
	// const invalidate = (key: typeof roomKey | typeof proposalsKey) => {
	// 	queryClient.invalidateQueries({ queryKey: key, exact: true });
	// };

	const channel = turnChannel({ roomId });
	const { messages } = useRealtime({
		channel,
		topics: TURN_TOPICS,
		token: () => getTurnRealtimeToken(roomId),
	});

	/**
	 * @description
	 * Processes newly-arrived realtime messages. Deliberately has NO
	 * cleanup function.
	 *
	 * `messages.delta` is a fresh array on effectively every render of
	 * this hook's owner (`inngest/react` does not memoize it against
	 * "no new messages arrived") — it is NOT safe to treat as "this only
	 * changes when a new message actually arrives". Putting a `reset()`
	 * in this effect's cleanup was the actual bug behind both reported
	 * symptoms: any unrelated re-render anywhere in this subtree gives
	 * `messages.delta` a new identity, which reruns this effect, which
	 * fires the OLD effect's cleanup first — wiping `activeTurnId` /
	 * `liveContent` back to empty — then replays every message from
	 * scratch. Because that wipe is itself a Valtio mutation, it
	 * re-renders every subscribed `ParticipantTurn`, which re-renders
	 * this hook's owner, which gives `messages.delta` yet another new
	 * identity — a self-sustaining reset↔replay loop with no natural
	 * exit. That's why streaming content never appeared to advance
	 * (each write was wiped again almost immediately) and why it was
	 * so severe performance-wise (an unbounded re-render cycle, not
	 * just an expensive one).
	 *
	 * The message-processing logic itself is idempotent per message
	 * (each branch is a plain state transition keyed by turnId), so
	 * reprocessing the same message twice if `messages.delta` ever
	 * legitimately repeats content is harmless — no cleanup is needed
	 * to guard against that.
	 */
	useEffect(() => {
		for (const message of messages.delta) {
			if (message.kind === "run") continue;

			switch (message.topic) {
				case "initiated": {
					const { turnId } = message.data;
					turnStreamActions.claimTurn(turnId);
					turnStreamActions.setProposalsVisible(false);
					break;
				}

				case "streamStarted": {
					turnStreamActions.markStreaming(message.data.turnId);
					break;
				}

				case "tokenAccumulated": {
					const { turnId, content } = message.data;
					turnStreamActions.setLiveContent(turnId, content);
					break;
				}

				case "settled": {
					const { turnId, content } = message.data;
					turnStreamActions.settleTurn(turnId, content);
					// invalidate(roomKey);
					// invalidate(proposalsKey);
					turnStreamActions.setProposalsVisible(true);
					break;
				}

				case "failed": {
					turnStreamActions.failTurn(message.data.turnId, {
						kind: message.data.kind,
						message: message.data.message,
						isRetryable: message.data.isRetryable,
						retryAfter: message.data.retryAfter,
					});
					// invalidate(roomKey);
					break;
				}

				case "abandoned": {
					turnStreamActions.abandonTurn(message.data.turnId);
					// invalidate(roomKey);
					break;
				}
			}
		}
	}, [messages.delta]);

	/**
	 * @description
	 * Reset lives in its OWN effect now, tied only to `roomId` — fires
	 * exactly once, when this subscriber actually unmounts or the user
	 * navigates to a different room. Not coupled to `messages.delta` in
	 * any way, so it can no longer fire on an unrelated re-render.
	 */
	// biome-ignore lint/correctness/useExhaustiveDependencies: stable ref
	useEffect(() => {
		return () => turnStreamActions.reset();
	}, [roomId]);

	useResumeStream(roomId, initialTurns);
}
