"use client";

import type { RoomDeliberationTurnDTO } from "@briom/app/bak";
import { Logo } from "@briom/components/logo";
import { TurnPerspective } from "@briom/rooms/_/turn/ui/turn-perspective";
import { TurnPerspectiveExpander } from "@briom/rooms/_/turn/ui/turn-perspective-expander";

import { FailedTurn } from "./_/failed-turn";

interface TurnRendererProps {
	content: string;
	isExpanded: boolean;
	isFailed: boolean;
	isPending: boolean;
	isRetryable?: boolean;
	isRetrying?: boolean;
	isStreaming: boolean;
	onRetried?: () => void;
	onToggleExpand: () => void;
	showAbort?: boolean;
	turn: RoomDeliberationTurnDTO;
}

export function TurnRenderer({
	content,
	isFailed,
	isExpanded,
	isPending,
	isRetryable = false,
	isRetrying = false,
	isStreaming,
	onRetried,
	onToggleExpand,
	showAbort,
	turn,
}: TurnRendererProps) {
	const hasContent = content.trim().length > 0;

	if (!hasContent) {
		if (isFailed) {
			return (
				<FailedTurn
					error={turn.error?.message ?? "Unknown error"}
					isRetrying={isRetrying}
					onRetried={isRetryable ? onRetried : undefined}
					showAbort={showAbort}
					title="Perspective was not generated"
				/>
			);
		}

		return (
			<div className="mt-4 flex items-center gap-4">
				<Logo animate />
				<span className="text-sm italic text-muted-foreground shimmer-text">
					{isPending ? "thinking for a moment..." : "shaping perspective..."}
				</span>
			</div>
		);
	}

	if (isFailed) {
		return (
			<TurnPerspectiveExpander
				className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
				isExpanded={isExpanded}
				onToggleExpand={onToggleExpand}
			>
				<TurnPerspective content={content} />
				<FailedTurn
					error={turn.error?.message ?? "Unknown error"}
					isRetrying={isRetrying}
					onRetried={isRetryable ? onRetried : undefined}
					title="Perspective was not fully generated"
				/>
			</TurnPerspectiveExpander>
		);
	}

	return (
		<TurnPerspectiveExpander
			className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
			isExpanded={isExpanded}
			isStreaming={isStreaming}
			onToggleExpand={onToggleExpand}
		>
			<TurnPerspective content={content} />
			{isStreaming && <Logo animate className="mt-4" />}
		</TurnPerspectiveExpander>
	);
}
