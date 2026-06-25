"use client";

import type { RoomDTO, TurnDTO } from "@briom/app";
import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { cn } from "@briom/libs/utils";
import { useMiniTimeline } from "@briom/rooms/_/deliberation/use-mini-timeline";

import { TimelineBar } from "./_/timeline-bar";

interface RoomTimelineProps {
	multiDeliberation?: boolean;
	participants: RoomDTO["participants"];
	turns: TurnDTO[];
}

export function RoomTimeline({
	multiDeliberation,
	participants,
	turns,
}: RoomTimelineProps) {
	const { calculateLogarithmicWidth, handleScrollToTurn, participantMap } =
		useMiniTimeline({ participants, turns });

	return (
		<AccordionItem value="timeline">
			<AccordionExpander title="Timeline" />
			<AccordionContent className="border-t p-4 max-h-[320px] overflow-y-auto space-y-px pr-2 no-scrollbar">
				{turns.length === 0 ? (
					<p className="text-xs text-muted-foreground/50 italic text-center py-2">
						Start deliberating to see the timeline...
					</p>
				) : (
					turns.map((turn) => {
						const isPending = turn.status === "pending";
						const isStreaming = turn.status === "streaming";
						const isFailed = turn.status === "failed";

						const moderator = turn.author.type === "moderator";
						const participant = turn.author.participantId
							? (participantMap.get(turn.author.participantId) ?? null)
							: null;

						const participantColor =
							!moderator && participant ? participant.theme : null;

						const barColorClass = isFailed
							? "bg-destructive"
							: participantColor?.dot || "bg-primary";

						const barWidth = (() => {
							if (isPending) return "30%";
							if (isFailed) return "100%";
							return calculateLogarithmicWidth(turn.perspective.content);
						})();

						const barClass = cn(
							"rounded-lg inline-block h-1.5 transition-[width] duration-300",
							isFailed && "bg-destructive",
							(isPending || isStreaming) && "shimmer-bar",
							!isFailed && !isPending && !isStreaming && barColorClass,
						);

						return (
							<TimelineBar
								className={barClass}
								isError={isFailed}
								isModeratorTurn={moderator}
								key={turn.id}
								onClick={() => handleScrollToTurn(turn.id)}
								participant={participant}
								showIntent={multiDeliberation}
								turn={turn}
								width={barWidth}
							/>
						);
					})
				)}
			</AccordionContent>
		</AccordionItem>
	);
}
