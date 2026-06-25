/**
 * @file participant-turn/index.tsx
 * @path src/app/(rooms)/rooms/[roomId]/_/room-orchestration/_/room-deliberation/_/turn-sequence/_/participant-turn/index.tsx
 *
 * ## Streaming Optimization
 *
 * This component is the key change. It subscribes to its own turn's slice in
 * `useTurnStreamStore` to get live token content during streaming — instead of
 * reading from the React Query cache (which previously triggered full-tree
 * re-renders on every token).
 *
 * **Re-render scope:**
 * - During streaming: only THIS component re-renders (subscribed to its turnId)
 * - All OTHER settled turns: zero re-renders (their cache entry doesn't change)
 * - After settled: component reads from query cache (normal, infrequent)
 *
 * **Fallback strategy:**
 * - Stream store has entry → use store values (live during streaming)
 * - Stream store entry absent → fall back to query cache turn values
 *   (handles page refresh, SSR hydration, already-settled turns)
 */

"use client";

import type {
	RoomDeliberationParticipantDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";
import { useStreamingTurn } from "@briom/rooms/_/turn/hooks/use-streaming-turn";
import { TurnPerspectiveActions } from "@briom/rooms/_/turn/ui/turn-perspective-actions";
import { format, parseISO } from "date-fns";
import { Fragment, memo } from "react";

import { ParticipantInfo } from "./_/turn-info";
import { TurnPending } from "./_/turn-pending";
import { TurnRenderer } from "./_/turn-renderer";

interface ParticipantTurnProps {
	isLastTurn?: boolean;
	participant: RoomDeliberationParticipantDTO;
	showAbort?: boolean;
	showIntent?: boolean;
	turn: RoomDeliberationTurnDTO;
}

function ParticipantTurnComponent({
	isLastTurn,
	participant,
	showAbort,
	showIntent,
	turn,
}: ParticipantTurnProps) {
	const theme = getParticipantTheme(participant.id);

	// Subscribe ONLY to this turn's streaming slice.
	// Returns null when the turn is not in the stream store (i.e., it's settled
	// and already removed, or was loaded from SSR without going through SSE).
	const streamingTurn = useStreamingTurn(turn.id);

	// Derive live values:
	// - When streaming: store has current content + status
	// - When settled or not in store: fall back to query cache (turn.*)
	const liveContent = streamingTurn?.content ?? turn.content;

	// Status resolution:
	// stream store "pending" | "streaming" → use store status (live)
	// stream store "settled" | "failed" | absent → use query cache status
	const liveStatus: typeof turn.status = (() => {
		if (
			streamingTurn?.status === "pending" ||
			streamingTurn?.status === "streaming"
		) {
			return streamingTurn.status;
		}
		return turn.status;
	})();

	const isFailed = liveStatus === "failed" || turn.status === "failed";
	const isPending = liveStatus === "pending";
	const isSettled = liveStatus === "settled";
	const isStreaming = liveStatus === "streaming";

	const time = turn.settledAt || turn.failedAt || turn.createdAt || null;
	const timeSent = time ? format(parseISO(time), "HH:mm") : "––:––";

	return (
		<div
			className="relative group space-y-2 w-full min-w-0 rounded-lg"
			id={turn.id}
		>
			<div className={cn("relative pl-4 border-l-2", theme.border)}>
				{isPending ? (
					<TurnPending
						className={theme.text}
						displayName={participant.name}
						qualifiedModel={participant.model}
					/>
				) : (
					<Fragment>
						<ParticipantInfo
							isFailed={isFailed}
							isStreaming={isStreaming}
							participant={participant}
							showIntent={showIntent}
							turn={turn}
						/>
						<TurnRenderer
							content={liveContent}
							isFailed={isFailed}
							isLastTurn={isLastTurn}
							isPending={isPending}
							isStreaming={isStreaming}
							showAbort={showAbort}
							turn={turn}
						/>
					</Fragment>
				)}
			</div>
			{isSettled && (
				<TurnPerspectiveActions content={liveContent} time={timeSent} />
			)}
		</div>
	);
}

export const ParticipantTurn = memo(ParticipantTurnComponent);
