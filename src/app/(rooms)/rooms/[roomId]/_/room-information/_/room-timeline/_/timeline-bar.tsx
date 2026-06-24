import type { RoomDTO, TurnDTO } from "@briom/app";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";

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
				<div className="text-xs space-y-1">
					<p
						className={cn(
							"font-semibold capitalize",
							isError ? "text-destructive" : "text-muted-foreground",
						)}
					>
						{isModeratorTurn ? "You" : (participant?.name ?? "Participant")}
						{showIntent && !isModeratorTurn && (
							<span
								className={cn(
									"capitalize text-[8px], px-0.5 rounded ml-1",
									theme.all,
								)}
							>
								{turn.status === "failed" ? "failed" : turn.intent}
							</span>
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
