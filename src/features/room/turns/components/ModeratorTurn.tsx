import { useState } from "react";

import { TurnActions } from "./internal/TurnActions";
import {
	TurnAttachment,
	type TurnAttachmentProps,
} from "./internal/TurnAttachment";
import { TurnContent } from "./internal/TurnContent";
import { TurnContentCollapser } from "./internal/TurnContentCollapser";

interface ModeratorTurnProps {
	/**
	 * @description
	 * Attachments referenced on this turn.
	 * Set this to empty array if the turn has 0 attachments
	 * instead of undefined or null.
	 */
	attachments: TurnAttachmentProps[];

	/**
	 * @description
	 * Raw content of this turn (typically in MD format).
	 */
	content: string;

	/**
	 * @description
	 * The ID of this turn.
	 * Used to point the position where `RoomTimeline`
	 * can scroll the view into.
	 *
	 * @see RoomTimeline
	 * On how they interact and references a turn.
	 */
	id: string;

	/**
	 * @description
	 * ISO 8601 timestamp when turn settled, null if not settled.
	 */
	settledAt: string | null;
}

export function ModeratorTurn({
	attachments,
	content,
	id,
	settledAt,
}: ModeratorTurnProps) {
	const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
	return (
		<div
			className="relative group space-y-2 max-w-lg min-w-0 ml-auto rounded-lg"
			id={id}
		>
			<div className="relative bg-muted/50 p-4 rounded-lg space-y-3">
				{attachments.length > 0 && (
					<div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/20">
						{attachments.map((attachment) => (
							<TurnAttachment key={attachment.name} {...attachment} />
						))}
					</div>
				)}
				<TurnContentCollapser
					className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
					isCollapsed={isCollapsed}
					onToggled={() => setIsCollapsed((prev) => !prev)}
				>
					<TurnContent content={content} />
				</TurnContentCollapser>
			</div>
			<TurnActions content={content} isModerator settledAt={settledAt} />
		</div>
	);
}
