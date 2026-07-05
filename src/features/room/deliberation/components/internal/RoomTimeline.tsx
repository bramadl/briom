"use client";

import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";
import type { RoomTurnDTO } from "@briom/core/app";
import { cn } from "@briom/libs/utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { getParticipantTheme } from "@briom/room/participant/settings/theme";
import { Fragment, useMemo } from "react";

import { useTimeline } from "../../hooks/use-timeline";

interface RoomTimelineBarProps {
	calculateWidth: (content: string | null | undefined) => string;
	onSelect: (turnId: string) => void;
	showIntent?: boolean;
	turn: RoomTurnDTO;
}

export function RoomTimelineBar({
	calculateWidth,
	onSelect,
	showIntent = true,
	turn,
}: RoomTimelineBarProps) {
	const isModeratorTurn = turn.author.type === "moderator";
	const isPending = turn.status === "pending";
	const isStreaming = turn.status === "streaming";
	const isFailed = turn.status === "failed";

	const participant = turn.author.profile.participant;
	const theme = getParticipantTheme(participant?.id);

	const barWidth = isPending
		? "25%"
		: isFailed
			? "100%"
			: calculateWidth(turn.content);

	const barClass = cn(
		"rounded-lg inline-block h-1.5 transition-[width] duration-300",
		isFailed && "bg-destructive",
		(isPending || isStreaming) && "shimmer-bar",
		!isFailed && !isPending && !isStreaming && (theme?.dot ?? "bg-primary"),
	);

	return (
		<HoverCard closeDelay={0} openDelay={0}>
			<HoverCardTrigger
				className={cn(
					"flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer",
					isModeratorTurn && "justify-end",
				)}
				onClick={() => onSelect(turn.id)}
			>
				<span className={barClass} style={{ width: barWidth }} />
			</HoverCardTrigger>
			<HoverCardContent
				align="center"
				side={isModeratorTurn ? "left" : "right"}
			>
				<div className="text-xs space-y-1.5">
					<p>
						<span
							className={cn(
								"font-semibold capitalize",
								isFailed
									? "text-destructive"
									: isModeratorTurn
										? "text-primary"
										: theme?.text,
							)}
						>
							{isModeratorTurn ? "You" : (participant?.name ?? "Participant")}
						</span>
						{showIntent && !isModeratorTurn && (
							<Fragment>
								<span className="text-muted-foreground/50 text-[10px] mx-2">
									|
								</span>
								<span
									className={cn(
										"capitalize text-[10px] px-1 py-px rounded",
										isFailed
											? "bg-destructive text-destructive-foreground"
											: theme?.all,
									)}
								>
									{isFailed ? "failed" : turn.intent}
								</span>
							</Fragment>
						)}
					</p>
					<p
						className={cn(
							"line-clamp-3 whitespace-pre-line",
							isFailed ? "text-destructive" : "text-foreground",
						)}
					>
						{isFailed
							? `Error: ${turn.error?.message}`
							: turn.content?.replace(/^\[.*?\]\s*/, "") ||
								"Empty perspective."}
					</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}

export function RoomTimeline() {
	const { isMultiDeliberation, room } = useRoom();
	const turns = useMemo(() => room.info.turns, [room.info.turns]);

	const { calculateLogarithmicWidth, scrollToTurn } = useTimeline({ turns });

	return (
		<AccordionItem value="timeline">
			<AccordionExpander title="Timeline" />
			<AccordionContent className="border-t p-4 max-h-[320px] overflow-y-auto space-y-px pr-2 no-scrollbar">
				{turns.length === 0 ? (
					<p className="text-xs text-muted-foreground/50 italic text-center py-2">
						Start deliberating to see the timeline...
					</p>
				) : (
					turns.map((turn) => (
						<RoomTimelineBar
							calculateWidth={calculateLogarithmicWidth}
							key={turn.id}
							onSelect={scrollToTurn}
							showIntent={isMultiDeliberation}
							turn={turn}
						/>
					))
				)}
			</AccordionContent>
		</AccordionItem>
	);
}
