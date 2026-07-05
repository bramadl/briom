import { turnChannel } from "@briom/inngest/channels/turn.channel";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { getTurnRealtimeToken } from "@briom/room/turns/actions/get-turn-realtime.action";
import { useTurnStore } from "@briom/room/turns/hooks/use-turn-store";
import { turnQueryOptions } from "@briom/room/turns/queries/query.options";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "inngest/react";
import { useCallback, useEffect } from "react";

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
 * Subscribes to every Turn-level event over Inngest Realtime — status
 * transitions AND token streaming, both on the same `turnChannel`
 * subscription. This is the ONLY `useRealtime` call for Turn concerns
 * in the whole room view; `LiveParticipantTurn` never opens its own —
 * it reads live content via `useLiveTurnContent(turnId)`, a scalar
 * selector into `useTurnStore`, which this hook is what populates.
 */
export function useTurnSubscriber(params: { roomId: string }) {
	const { roomId } = params;
	const queryClient = useQueryClient();

	const roomQueryKey = roomQueryOptions.getRoom(roomId).queryKey;
	const turnQueryKey = turnQueryOptions.getProposals(roomId).queryKey;

	const reset = useTurnStore((s) => s.reset);
	const claimTurn = useTurnStore((s) => s.claimTurn);
	const markStreaming = useTurnStore((s) => s.markStreaming);
	const setLiveContent = useTurnStore((s) => s.setLiveContent);
	const settleTurn = useTurnStore((s) => s.settleTurn);
	const failTurn = useTurnStore((s) => s.failTurn);
	const abandonTurn = useTurnStore((s) => s.abandonTurn);
	const setProposalsVisible = useTurnStore((s) => s.setProposalsVisible);

	const channel = turnChannel({ roomId });

	const { messages } = useRealtime({
		channel,
		topics: TURN_TOPICS,
		token: () => getTurnRealtimeToken(roomId),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: queryClient is stable.
	const invalidateRoom = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: roomQueryKey, exact: true });
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: queryClient is stable.
	const invalidateProposals = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: turnQueryKey, exact: true });
	}, []);

	// store setters are stable zustand references
	// biome-ignore lint/correctness/useExhaustiveDependencies: queryClient is stable.
	useEffect(() => {
		for (const message of messages.delta) {
			if (message.kind === "run") continue;

			switch (message.topic) {
				case "initiated": {
					const { turnId } = message.data;
					claimTurn(turnId);
					// A participant has been handed the floor — whatever
					// proposals were showing belong to the previous
					// moderator turn and are now stale. This is the
					// realtime-driven half of hiding proposals; the
					// optimistic half fires synchronously from
					// `useInitiateTurnMutation`'s `onSuccess`, ahead of
					// this message arriving.
					setProposalsVisible(false);
					break;
				}

				case "streamStarted": {
					markStreaming(message.data.turnId);
					break;
				}

				case "tokenAccumulated": {
					const { turnId, content } = message.data;
					setLiveContent(turnId, content);
					break;
				}

				case "settled": {
					const { turnId } = message.data;
					settleTurn(turnId);
					invalidateRoom();
					// The floor is back with the moderator — refresh and
					// reveal whatever new proposals the BE generated off
					// the back of this settled turn.
					invalidateProposals();
					setProposalsVisible(true);
					break;
				}

				case "failed": {
					failTurn(message.data.turnId);
					invalidateRoom();
					break;
				}

				case "abandoned": {
					// One of two independent abandonment guards — the
					// other lives wherever a direct `getTurn` fallback
					// is checked (formerly the poll loop in
					// `useTurnPolling`, now absent entirely since
					// there's no more polling to guard against — this
					// is the sole detection point now).
					abandonTurn(message.data.turnId);
					invalidateRoom();
					break;
				}
			}
		}
	}, [messages.delta, roomId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: store setter is a stable zustand reference.
	useEffect(() => {
		return () => reset();
	}, [roomId]);
}
