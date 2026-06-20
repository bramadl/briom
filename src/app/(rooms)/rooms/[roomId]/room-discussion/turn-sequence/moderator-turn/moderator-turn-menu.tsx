"use client";

import { Button } from "@briom/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@briom/components/ui/tooltip";
import { cn } from "@briom/libs/utils";
import { CheckIcon, CopyIcon, EditIcon } from "lucide-react";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

interface ModeratorTurnMenuProps {
	content: string;
	time: string;
}

export function ModeratorTurnMenu({ time, content }: ModeratorTurnMenuProps) {
	const [_, copy] = useCopyToClipboard();
	const [isCopied, setIsCopied] = useState(false);

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
		{
			id: "edit",
			icon: EditIcon,
			tooltip: "Edit Message",
			onClick: () => console.log("Edit clicked"),
		},
	];

	return (
		<div className="flex flex-row-reverse items-center gap-2 flex-1 text-[11px] text-muted-foreground/50 font-mono tabular-nums lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
			{time}
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
