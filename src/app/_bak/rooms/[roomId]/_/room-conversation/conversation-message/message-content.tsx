import { ExpandableContent } from "@briom/components/ui/expandable-content";
import { useEffect } from "react";

import { RenderedMessage } from "./rendered-message";

interface MessageContentProps {
	content: string;
	isLatestTurn?: boolean;
	onMounted(): void;
}

export function MessageContent({
	content,
	isLatestTurn,
	onMounted,
}: MessageContentProps) {
	useEffect(() => {
		onMounted();
	});

	return (
		<ExpandableContent
			className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
			defaultCollapsed={!isLatestTurn}
		>
			<RenderedMessage content={content} />
		</ExpandableContent>
	);
}
