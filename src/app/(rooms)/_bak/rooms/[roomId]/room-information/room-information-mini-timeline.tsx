"use client";

import type { RoomDTO, TurnDTO } from "@briom/app";
import {
	AccordionContent,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { Button } from "@briom/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";
import { cn } from "@briom/libs/utils";
import { ExpandIcon } from "lucide-react";
import { useMemo } from "react";

import {
	getParticipantTheme,
	type PARTICIPANT_COLORS,
} from "../../../../_/participant/config/theme";

import { RoomInformationHeader } from "./room-information-header";

interface RoomInformationMiniTimelineProps {
	participants: RoomDTO["participants"];
	turns: TurnDTO[];
}

export function RoomInformationMiniTimeline({
	participants,
	turns,
}: RoomInformationMiniTimelineProps) {
	const participantMap = useMemo(() => {
		const map = new Map<
			string,
			RoomDTO["participants"][number] & {
				theme: (typeof PARTICIPANT_COLORS)[number];
			}
		>();
		participants.forEach((p) => {
			map.set(p.id, {
				...p,
				theme: getParticipantTheme(p.id),
			});
		});
		return map;
	}, [participants]);

	const maxContentLength = useMemo(() => {
		if (turns.length === 0) return 1;
		return Math.max(...turns.map((t) => t.perspective.content?.length || 0), 1);
	}, [turns]);

	const calculateLogarithmicWidth = (content: string): string => {
		const length = content?.length || 0;
		if (length <= 0) return "1%";

		const ratio = length / maxContentLength;
		const smoothed = ratio ** 0.6;
		const minWidth = 8;
		const maxWidth = 100;

		return `${(minWidth + smoothed * (maxWidth - minWidth)).toFixed(1)}%`;
	};

	const handleScrollToTurn = (turnId: string) => {
		const element = document.getElementById(turnId);
		if (!element) return;

		element.scrollIntoView({ behavior: "smooth", block: "center" });

		let isScrolling: NodeJS.Timeout;
		const flashClass = "animate-turn-flash";

		const triggerWobble = () => {
			window.removeEventListener("scroll", scrollHandler);

			element.classList.remove(flashClass);
			void element.offsetWidth;
			element.classList.add(flashClass);

			setTimeout(() => {
				element.classList.remove(flashClass);
			}, 1200);
		};

		const scrollHandler = () => {
			clearTimeout(isScrolling);
			isScrolling = setTimeout(triggerWobble, 300);
		};

		window.addEventListener("scroll", scrollHandler);
		setTimeout(() => {
			window.removeEventListener("scroll", scrollHandler);
			if (!element.classList.contains(flashClass)) {
				element.classList.add(flashClass);
				setTimeout(() => element.classList.remove(flashClass), 1200);
			}
		}, 500);
	};

	return (
		<AccordionItem value="timeline">
			<RoomInformationHeader title="Timeline">
				<Button
					onClick={(e) => {
						e.preventDefault();
					}}
					size="icon-xs"
					variant="ghost"
				>
					<ExpandIcon className="text-muted-foreground" />
				</Button>
			</RoomInformationHeader>
			<AccordionContent className="border-t p-4 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
				{turns.length === 0 ? (
					<p className="text-xs text-muted-foreground/50 italic text-center py-2">
						Start deliberating to see the timeline...
					</p>
				) : (
					turns.map((turn) => {
						const isPending = turn.status === "pending";
						const isStreaming = turn.status === "streaming";
						const isFailed = turn.status === "failed";

						const isModeratorTurn = turn.author.type === "moderator";
						const participant = turn.author.participantId
							? participantMap.get(turn.author.participantId)
							: null;

						const participantColor =
							!isModeratorTurn && participant ? participant.theme : null;

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
							<HoverCard closeDelay={0} key={turn.id} openDelay={0}>
								<HoverCardTrigger
									className={cn(
										"flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer",
										isModeratorTurn && "justify-end",
									)}
									onClick={() => handleScrollToTurn(turn.id)}
								>
									<span
										className={cn(
											"rounded-lg inline-block h-1.5 transition-[width]",
											barClass,
										)}
										style={{ width: barWidth }}
									/>
								</HoverCardTrigger>
								<HoverCardContent
									align="center"
									side={isModeratorTurn ? "left" : "right"}
								>
									<div className="text-xs space-y-1">
										<p
											className={cn(
												"font-semibold capitalize",
												isFailed ? "text-destructive" : "text-muted-foreground",
											)}
										>
											{isModeratorTurn
												? "You"
												: (participant?.name ?? "Participant")}
										</p>
										{
											<p
												className={cn(
													"line-clamp-3 whitespace-pre-line",
													isFailed ? "text-destructive" : "text-foreground",
												)}
											>
												{isFailed
													? `Error: ${turn.error?.message}`
													: turn.perspective.content?.replace(
															/^\[.*?\]\s*/,
															"",
														) || "Empty perspective."}
											</p>
										}
									</div>
								</HoverCardContent>
							</HoverCard>
						);
					})
				)}
			</AccordionContent>
		</AccordionItem>
	);
}
