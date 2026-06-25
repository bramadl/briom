"use client";

import type { RoomDTO, TurnDTO } from "@briom/app";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";
import { Fragment } from "react/jsx-runtime";

interface TimelineBarProps {
	className: string;
	isError?: boolean;
	isModeratorTurn?: boolean;
	onClick: () => void;
	participant: RoomDTO["participants"][number] | null;
	showIntent?: boolean;
	turn: TurnDTO;
	width: string;
}

export function TimelineBar({
	className,
	isError,
	isModeratorTurn,
	onClick,
	participant,
	showIntent,
	turn,
	width,
}: TimelineBarProps) {
	const theme = getParticipantTheme(participant?.id);
	return (
		<HoverCard closeDelay={0} openDelay={0}>
			<HoverCardTrigger
				className={cn(
					"flex w-full py-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer",
					isModeratorTurn && "justify-end",
				)}
				onClick={onClick}
			>
				<span
					className={cn(
						"rounded-lg inline-block h-1.5 transition-[width]",
						className,
					)}
					style={{ width }}
				/>
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
								isError
									? "text-destructive"
									: isModeratorTurn
										? "text-primary"
										: theme.text,
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
										isError
											? "bg-destructive text-destructive-foreground"
											: theme.all,
									)}
								>
									{turn.status === "failed" ? "failed" : turn.intent}
								</span>
							</Fragment>
						)}
					</p>
					{
						<p
							className={cn(
								"line-clamp-3 whitespace-pre-line",
								isError ? "text-destructive" : "text-foreground",
							)}
						>
							{isError
								? `Error: ${turn.error?.message}`
								: turn.perspective.content?.replace(/^\[.*?\]\s*/, "") ||
									"Empty perspective."}
						</p>
					}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
