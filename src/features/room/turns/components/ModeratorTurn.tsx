import {
	useIsTurnExpanded,
	useTurnCollapseStore,
} from "@briom/room/turns/hooks/use-turn-collapse-store";

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
	 * True if this is the last turn in `room.info.turns` — computed by
	 * `RoomSequence` from array position. Drives rule 1 of the
	 * auto-collapse spec: the latest turn is always expanded,
	 * regardless of any manual collapse/expand history.
	 */
	isLatest: boolean;

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
	isLatest,
	settledAt,
}: ModeratorTurnProps) {
	const isExpanded = useIsTurnExpanded(id, {
		isActiveStreaming: false,
		isLatest,
	});

	const toggleExpanded = useTurnCollapseStore((s) => s.toggleExpanded);

	return (
		<div
			className="relative group space-y-2 max-w-lg min-w-0 ml-auto rounded-lg"
			id={id}
		>
			{attachments.length > 0 && (
				<div className="flex flex-wrap justify-end gap-1.5">
					{attachments.map((attachment) => (
						<TurnAttachment key={attachment.name} {...attachment} />
					))}
				</div>
			)}
			<div className="relative bg-muted/50 p-4 rounded-lg space-y-3">
				<TurnContentCollapser
					className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
					isCollapsed={!isExpanded}
					onToggled={() => toggleExpanded(id, isExpanded)}
				>
					<TurnContent content={content} />
				</TurnContentCollapser>
			</div>
			<TurnActions content={content} isModerator settledAt={settledAt} />
		</div>
	);
}
