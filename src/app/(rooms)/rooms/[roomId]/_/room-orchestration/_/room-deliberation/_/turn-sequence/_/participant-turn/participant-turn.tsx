"use client";

import type {
	RoomDeliberationParticipantDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app";
import { cn } from "@briom/libs/utils";
import { useDeliberation } from "@briom/rooms/_/deliberation/hooks/use-deliberation";
import { useStreamingTurn } from "@briom/rooms/_/deliberation/hooks/use-streaming-turn";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";
import { useRetryTurnMutation } from "@briom/rooms/_/turn/mutations/use-retry-turn.mutation";
import { TurnPerspectiveActions } from "@briom/rooms/_/turn/ui/turn-perspective-actions";
import { format, parseISO } from "date-fns";
import { memo } from "react";

import { ParticipantInfo } from "./_/turn-info";
import { TurnRenderer } from "./_/turn-renderer/turn-renderer";

interface ParticipantTurnProps {
	isExpanded: boolean;
	isRetryable?: boolean;
	onToggleExpand: () => void;
	participant: RoomDeliberationParticipantDTO;
	showAbort?: boolean;
	showIntent?: boolean;
	turn: RoomDeliberationTurnDTO;
}

function ParticipantTurnComponent({
	isExpanded,
	isRetryable = false,
	participant,
	showAbort,
	showIntent,
	turn,
	onToggleExpand,
}: ParticipantTurnProps) {
	const { isRetrying, setIsRetrying } = useDeliberation();
	const retryMutation = useRetryTurnMutation();
	const handleRetry = isRetryable
		? () => {
				setIsRetrying(true);
				retryMutation.mutate(
					{ turnId: turn.id },
					{ onSettled: () => setIsRetrying(false) },
				);
			}
		: undefined;

	const theme = getParticipantTheme(participant.id);
	const streamingTurn = useStreamingTurn(turn.id);

	const liveContent = streamingTurn?.content ?? turn.content;
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

	const resolvedIsRetrying =
		isRetrying || retryMutation.isPending || isPending || isStreaming;

	return (
		<div
			className="relative group space-y-2 w-full min-w-0 rounded-lg"
			id={turn.id}
		>
			<div className={cn("relative pl-4 border-l-2", theme.border)}>
				<ParticipantInfo
					isFailed={isFailed}
					isStreaming={isStreaming}
					participant={participant}
					showIntent={showIntent}
					turn={turn}
				/>
				<TurnRenderer
					content={liveContent}
					isExpanded={isExpanded}
					isFailed={isFailed}
					isPending={isPending}
					isRetryable={isRetryable}
					isRetrying={resolvedIsRetrying}
					isStreaming={isStreaming}
					onRetried={handleRetry}
					onToggleExpand={onToggleExpand}
					showAbort={showAbort}
					turn={turn}
				/>
			</div>
			{isSettled && (
				<TurnPerspectiveActions content={liveContent} time={timeSent} />
			)}
		</div>
	);
}

export const ParticipantTurn = memo(ParticipantTurnComponent);
