"use client";

// import { format, parseISO } from "date-fns";

const TurnPerspectiveExpander = dynamic(
	() => import("../turn-perspective").then((m) => m.TurnPerspectiveExpander),
	{ ssr: false },
);

import dynamic from "next/dynamic";
import { TurnPerspective } from "../turn-perspective";

import { ModeratorTurnMenu } from "./moderator-turn-menu";

const SHORT_MARKDOWN = `
## Quick Summary

This is a **bold statement** and *italic emphasis*. Here's a \`code snippet\`:

\`\`\`javascript
const x = 42;
console.log(x);
\`\`\`

- Item one
- Item two with [a link](https://example.com)
- Item three
`;

export function ModeratorTurn() {
	// const timeSent = format(parseISO(""), "HH:mm")

	return (
		<div className="group space-y-2 max-w-lg ml-auto">
			<div className="relative bg-muted/50 p-4 rounded-lg">
				<TurnPerspectiveExpander className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert">
					<TurnPerspective content={SHORT_MARKDOWN} />
				</TurnPerspectiveExpander>
			</div>
			<ModeratorTurnMenu content={""} time={"13:26"} />
		</div>
	);
}
