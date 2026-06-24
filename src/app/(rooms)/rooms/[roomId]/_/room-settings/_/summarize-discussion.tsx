import type { RoomDTO } from "@briom/app";
import { Button } from "@briom/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@briom/components/ui/popover";
import { Separator } from "@briom/components/ui/separator";
import { useIsMobile } from "@briom/hooks/use-mobile";
import { cn } from "@briom/libs/utils";
import { ParticipantBadge } from "@briom/rooms/_/participant/ui/participant-badge";
import { PaperclipIcon } from "lucide-react";
import { useState } from "react";

interface SummarizeDiscussionProps {
	participants: RoomDTO["participants"];
}

export function SummarizeDiscussion({
	participants,
}: SummarizeDiscussionProps) {
	const isMobile = useIsMobile();
	const [open, setOpen] = useState<boolean>(false);

	const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

	return (
		<Popover
			onOpenChange={(v) => {
				if (v) setSelectedModelId(null);
				setOpen(v);
			}}
			open={open}
		>
			<PopoverTrigger asChild>
				<Button size={isMobile ? "icon" : "default"} variant="secondary">
					<PaperclipIcon />
					<span className="hidden sm:inline">Summarize</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom">
				<PopoverHeader>
					<PopoverTitle>Summarize Deliberation</PopoverTitle>
					<PopoverDescription>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel ullam
						atque, deleniti minus impedit quae saepe.
					</PopoverDescription>
				</PopoverHeader>
				<div className="flex flex-col gap-2">
					<ul className="space-y-1">
						{participants.map((participant) => (
							<li
								className={cn(
									"text-sm border border-transparent rounded-lg",
									participant.id === selectedModelId
										? "border-muted-foreground/5 bg-muted"
										: "hover:bg-muted/50",
								)}
								key={participant.id}
							>
								<button
									className="size-full flex items-center gap-3 p-2 outline-none select-none"
									onClick={() =>
										setSelectedModelId((prev) =>
											prev === participant.id ? null : participant.id,
										)
									}
									type="button"
								>
									<ParticipantBadge
										name={participant.name}
										participantId={participant.id}
									/>
									<span className="flex flex-col items-start">
										<span>{participant.name}</span>
										<span className="text-muted-foreground text-xs">
											{participant.qualifiedModel}
										</span>
									</span>
								</button>
							</li>
						))}
					</ul>
					<Separator />
					<div className="flex items-center justify-end gap-2">
						<Button disabled={!selectedModelId}>Summarize</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
