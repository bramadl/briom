"use client";

import type { RoomDeliberationTurnDTO } from "@briom/app/bak";
import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { cn } from "@briom/libs/utils";
import { useTimeline } from "@briom/rooms/_/deliberation/hooks/use-timeline";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";

import { TimelineBar } from "./_/timeline-bar";

interface RoomTimelineProps {
	multiDeliberation?: boolean;
	turns: RoomDeliberationTurnDTO[];
}

export function RoomTimeline({ multiDeliberation, turns }: RoomTimelineProps) {
	const { calculateLogarithmicWidth, handleScrollToTurn } = useTimeline({
		turns,
	});

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

						const isModerator = turn.author.type === "moderator";
						const participant = turn.author.profile
							? {
									id: turn.author.profile.id,
									model: turn.author.profile.model,
									name: turn.author.profile.displayName,
								}
							: null;

						const participantColor = participant
							? getParticipantTheme(turn.author.profile?.id)
							: null;

						const barColorClass = isFailed
							? "bg-destructive"
							: participantColor?.dot || "bg-primary";

						const barWidth = (() => {
							if (isPending) return "25%";
							if (isFailed) return "100%";
							return calculateLogarithmicWidth(turn.content);
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
								isModeratorTurn={isModerator}
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
