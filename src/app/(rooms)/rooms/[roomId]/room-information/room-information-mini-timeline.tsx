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
} from "../../../mappings/participant-colors.map";

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
		const map = new Map<string, (typeof PARTICIPANT_COLORS)[number]>();
		participants.forEach((p) => {
			map.set(p.id, getParticipantTheme(p.id));
		});
		return map;
	}, [participants]);

	const calculateLogarithmicWidth = (content: string): string => {
		const length = content?.length || 0;
		if (length <= 0) return "20%";

		const minWidth = 20;
		const maxWidth = 100;

		const logValue = Math.log(length + 1);
		const estimatedMaxLog = Math.log(1500);
		const ratio = Math.min(logValue / estimatedMaxLog, 1);
		const finalWidth = minWidth + ratio * (maxWidth - minWidth);

		return `${finalWidth.toFixed(1)}%`;
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
						const isModeratorTurn = turn.author.type === "moderator";
						const participantColor =
							!isModeratorTurn && turn.author.participantId
								? participantMap.get(turn.author.participantId)
								: null;

						const barColorClass = participantColor?.dot || "bg-primary";
						const dynamicWidth = calculateLogarithmicWidth(
							turn.perspective.content,
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
											"rounded-lg inline-block h-1.5",
											barColorClass,
										)}
										style={{ width: dynamicWidth }}
									/>
								</HoverCardTrigger>
								<HoverCardContent
									align="center"
									side={isModeratorTurn ? "left" : "right"}
								>
									<div className="text-xs space-y-1">
										<p className="font-semibold capitalize text-muted-foreground">
											{turn.author.type} {turn.intent ? `• ${turn.intent}` : ""}
										</p>
										<p className="line-clamp-3 text-foreground whitespace-pre-line">
											{turn.perspective.content?.replace(/^\[.*?\]\s*/, "") ||
												"Empty perspective."}
										</p>
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
