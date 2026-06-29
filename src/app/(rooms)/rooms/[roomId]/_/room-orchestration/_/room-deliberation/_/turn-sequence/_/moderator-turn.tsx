"use client";

import type { RoomDeliberationTurnDTO } from "@briom/app";
import { TurnPerspective } from "@briom/rooms/_/turn/ui/turn-perspective";
import { TurnPerspectiveActions } from "@briom/rooms/_/turn/ui/turn-perspective-actions";
import { TurnPerspectiveExpander } from "@briom/rooms/_/turn/ui/turn-perspective-expander";
import { format, parseISO } from "date-fns";
import { FileCodeIcon, ImageIcon } from "lucide-react";
import { memo, useState } from "react";

interface ModeratorTurnProps {
	turn: RoomDeliberationTurnDTO;
}

function getAttachmentIcon(mediaType: "text" | "image") {
	if (mediaType === "image") return <ImageIcon className="size-3 shrink-0" />;
	return <FileCodeIcon className="size-3 shrink-0" />;
}

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	return `${Math.round(bytes / 1024)} KB`;
}

function ModeratorTurnComponent({ turn }: ModeratorTurnProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const time = turn.settledAt || turn.failedAt || turn.createdAt || null;
	const timeSent = time ? format(parseISO(time), "HH:mm") : "––:––";

	const hasAttachments = turn.attachments.length > 0;

	return (
		<div
			className="relative group space-y-2 max-w-lg min-w-0 ml-auto rounded-lg"
			id={turn.id}
		>
			<div className="relative bg-muted/50 p-4 rounded-lg space-y-3">
				{hasAttachments && (
					<div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/20">
						{turn.attachments.map((a) => (
							<a
								className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 border border-border/30 text-[11px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors max-w-[180px]"
								href={a.url}
								key={a.url}
								rel="noopener noreferrer"
								target="_blank"
							>
								{getAttachmentIcon(a.mediaType)}
								<span className="truncate font-mono">{a.name}</span>
								<span className="shrink-0 opacity-60">
									{formatSize(a.sizeBytes)}
								</span>
							</a>
						))}
					</div>
				)}
				<TurnPerspectiveExpander
					className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
					isExpanded={isExpanded}
					onToggleExpand={() => setIsExpanded((v) => !v)}
				>
					<TurnPerspective content={turn.content} />
				</TurnPerspectiveExpander>
			</div>
			<TurnPerspectiveActions content={turn.content} time={timeSent} />
		</div>
	);
}

export const ModeratorTurn = memo(ModeratorTurnComponent);
