"use client";

import type { TurnDTO } from "@briom/app";
import { TurnPerspective } from "@briom/rooms/_/turn/ui/turn-perspective";
import { TurnPerspectiveActions } from "@briom/rooms/_/turn/ui/turn-perspective-actions";
import { TurnPerspectiveExpander } from "@briom/rooms/_/turn/ui/turn-perspective-expander";
import { format, parseISO } from "date-fns";
import { memo } from "react";

interface ModeratorTurnProps {
	turn: TurnDTO;
}

function ModeratorTurnComponent({ turn }: ModeratorTurnProps) {
	const timeSent = turn.settledAt
		? format(parseISO(turn.settledAt), "HH:mm")
		: "--:--";

	return (
		<div
			className="relative group space-y-2 max-w-lg ml-auto rounded-lg"
			id={turn.id}
		>
			<div className="relative bg-muted/50 p-4 rounded-lg">
				<TurnPerspectiveExpander className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert">
					<TurnPerspective content={turn.perspective.content} />
				</TurnPerspectiveExpander>
			</div>
			<TurnPerspectiveActions
				content={turn.perspective.content}
				time={timeSent}
			/>
		</div>
	);
}

export const ModeratorTurn = memo(ModeratorTurnComponent);
