"use client";

import { Button } from "@briom/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@briom/components/ui/tooltip";
import { cn } from "@briom/libs/utils";
import { format } from "date-fns";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

interface TurnActionsProps {
	/**
	 * @description
	 * Raw content (usually in MD format).
	 */
	content: string;

	/**
	 * @description
	 * Wether this turn is from Moderator.
	 */
	isModerator?: boolean;

	/**
	 * @description
	 * ISO 8601 timestamp indicating the time when this
	 * turn was settled.
	 *
	 * If `null`, the turn will display string
	 * placeholder "––:––".
	 */
	settledAt: string | null;
}

export function TurnActions({
	content,
	isModerator,
	settledAt,
}: TurnActionsProps) {
	const [_, copy] = useCopyToClipboard();
	const [isCopied, setIsCopied] = useState(false);

	const timeSent = useMemo(() => {
		if (!settledAt) return "––:––";
		return format(new Date(settledAt), "HH:mm");
	}, [settledAt]);

	const inlineActions = [
		{
			id: "copy",
			icon: isCopied ? CheckIcon : CopyIcon,
			tooltip: isCopied ? "Copied!" : "Copy Message",
			onClick: async () => {
				const success = await copy(content);
				if (success) {
					setIsCopied(true);
					setTimeout(() => setIsCopied(false), 2000);
				}
			},
		},
	];

	return (
		<div
			className={cn(
				"absolute top-full inset-x-0 flex items-center gap-2 flex-1 text-[11px] text-muted-foreground/50 font-mono tabular-nums md:opacity-0 group-hover:opacity-100 transition-opacity duration-300",
				!isModerator && "flex-row-reverse",
			)}
		>
			{timeSent}
			<span className="flex-1">
				<span className="block bg-border h-px md:w-0 group-hover:w-full transition-[width] duration-500" />
			</span>
			<div className="flex items-center">
				{inlineActions.map((action, i) => {
					return (
						<Tooltip disableHoverableContent key={i.toString()}>
							<TooltipTrigger asChild>
								<Button onClick={action.onClick} size="icon-xs" variant="ghost">
									<action.icon
										className={cn(
											action.id === "copy" && isCopied && "text-green-500",
										)}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent align="center" side="top">
								{action.tooltip}
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</div>
	);
}
