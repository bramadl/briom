"use client";

import type { RoomTurnDTO } from "@briom/core/app";
import { turnChannel } from "@briom/inngest/channels/turn.channel";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { getTurnRealtimeToken } from "@briom/room/turns/actions/get-turn-realtime.action";
import { turnQueryOptions } from "@briom/room/turns/queries/query.options";
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

	const queryClient = useQueryClient();
	const roomKey = roomQueryOptions.getRoom(roomId).queryKey;
	const proposalKey = turnQueryOptions.getProposals(roomId).queryKey;

	const channel = turnChannel({ roomId });
	const { messages } = useRealtime({
		channel,
		topics: TURN_TOPICS,
		token: () => getTurnRealtimeToken(roomId),
		pauseOnHidden: false,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: stable ref.
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
					const { turnId, token } = message.data;
					turnStreamActions.appendLiveContent(turnId, token);
					break;
				}

				case "settled": {
					const { turnId, content } = message.data;
					turnStreamActions.settleTurn(turnId, content);
					queryClient
						.invalidateQueries({ queryKey: proposalKey, exact: true })
						.then(() => {
							setTimeout(() => {
								turnStreamActions.setProposalsVisible(true);
							}, 600);
						});
					break;
				}

				case "failed": {
					turnStreamActions.failTurn(message.data.turnId, {
						kind: message.data.kind,
						message: message.data.message,
						isRetryable: message.data.isRetryable,
						retryAfter: message.data.retryAfter,
					});
					queryClient
						.invalidateQueries({ queryKey: proposalKey, exact: true })
						.then(() => {
							setTimeout(() => {
								turnStreamActions.setProposalsVisible(true);
							}, 600);
						});
					break;
				}

				case "abandoned": {
					turnStreamActions.abandonTurn(message.data.turnId);
					queryClient.invalidateQueries({ queryKey: roomKey, exact: true });
					break;
				}
			}
		}
	}, [messages.delta]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: stable ref.
	useEffect(() => {
		return () => turnStreamActions.hardReset();
	}, [roomId]);

	useResumeStream(roomId, initialTurns);
}
