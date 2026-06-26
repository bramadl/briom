"use client";

import type {
	RoomDeliberationParticipantDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app";
import { cn } from "@briom/libs/utils";
import { useStreamingTurn } from "@briom/rooms/_/deliberation/hooks/use-streaming-turn";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";
import { TurnPerspectiveActions } from "@briom/rooms/_/turn/ui/turn-perspective-actions";
import { format, parseISO } from "date-fns";
import { Fragment, memo } from "react";

import { ParticipantInfo } from "./_/turn-info";
import { TurnPending } from "./_/turn-pending";
import { TurnRenderer } from "./_/turn-renderer/turn-renderer";

interface ParticipantTurnProps {
	isLastTurn?: boolean;
	isRetryable?: boolean;
	participant: RoomDeliberationParticipantDTO;
	showAbort?: boolean;
	showIntent?: boolean;
	turn: RoomDeliberationTurnDTO;
}

function ParticipantTurnComponent({
	isLastTurn,
	isRetryable = false,
	participant,
	showAbort,
	showIntent,
	turn,
}: ParticipantTurnProps) {
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
							isRetryable={isRetryable}
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
