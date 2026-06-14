import { Button } from "@briom/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@briom/components/ui/tooltip";
import { cn } from "@briom/libs/utils";

import { MESSAGE_ACTIONS } from "./message.actions";

interface MessageActionsProps {
	isUser?: boolean;
	time: string;
}

export function MessageActions({ time, isUser }: MessageActionsProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 flex-1 text-[11px] text-muted-foreground/50 font-mono tabular-nums opacity-0 group-hover:opacity-100 transition-opacity duration-300",
				!isUser && "flex-row-reverse",
			)}
		>
			{time}
			<span className="flex-1">
				<span className="block bg-border h-px w-0 group-hover:w-full transition-[width] duration-500" />
			</span>
			<div className="flex items-center">
				{MESSAGE_ACTIONS.map((action, i) => {
					if (action.forUser && !action.forAi && !isUser) return null;
					if (action.forAi && !action.forUser && isUser) return null;
					const tooltip =
						typeof action.tooltip === "string"
							? { children: action.tooltip }
							: action.tooltip;
					return (
						<Tooltip disableHoverableContent key={i.toString()}>
							<TooltipTrigger asChild>
								<Button size="icon-xs" variant="ghost">
									<action.icon />
								</Button>
							</TooltipTrigger>
							<TooltipContent align="center" side="top" {...tooltip} />
						</Tooltip>
					);
				})}

				{/* 
				{isUser ? (
					<Button size="icon-xs" variant="ghost">
						<Edit />
					</Button>
				) : (
					<Fragment>
						<Button size="icon-xs" variant="ghost">
							<ThumbsUp />
						</Button>
						<Button size="icon-xs" variant="ghost">
							<ThumbsDown />
						</Button>
						<Button size="icon-xs" variant="ghost">
							<Reply />
						</Button>
					</Fragment>
				)} */}
			</div>
		</div>
	);
}
