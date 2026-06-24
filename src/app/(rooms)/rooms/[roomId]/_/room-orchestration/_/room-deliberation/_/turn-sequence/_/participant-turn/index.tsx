"use client";

import type { RoomDTO, TurnDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";
import { TurnPerspectiveActions } from "@briom/rooms/_/turn/ui/turn-perspective-actions";
import { format, parseISO } from "date-fns";
import { Fragment, memo } from "react";

import { ParticipantInfo } from "./_/turn-info";
import { TurnPending } from "./_/turn-pending";
import { TurnRenderer } from "./_/turn-renderer";

interface ParticipantTurnProps {
	isLastTurn?: boolean;
	participant: RoomDTO["participants"][number];
	showIntent?: boolean;
	turn: TurnDTO;
}

function ParticipantTurnComponent({
	isLastTurn,
	participant,
	showIntent,
	turn,
}: ParticipantTurnProps) {
	const theme = getParticipantTheme(turn.author.participantId);

	const isFailed = turn.status === "failed";
	const isPending = turn.status === "pending";
	const isSettled = turn.status === "settled";
	const isStreaming = turn.status === "streaming";

	const timeSent = turn.settledAt
		? format(parseISO(turn.settledAt), "HH:mm")
		: turn.failedAt
			? format(parseISO(turn.failedAt), "HH:mm")
			: "--:--";

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
						qualifiedModel={participant.qualifiedModel}
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
						<TurnRenderer isLastTurn={isLastTurn} turn={turn} />
					</Fragment>
				)}
			</div>
			{isSettled && (
				<TurnPerspectiveActions
					content={turn.perspective.content}
					time={timeSent}
				/>
			)}
		</div>
	);
}

export const ParticipantTurn = memo(ParticipantTurnComponent);
