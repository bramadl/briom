"use client";

import type { TurnDTO } from "@briom/app";
import { Logo } from "@briom/components/logo";
import { useRetryTurnMutation } from "@briom/rooms/_/turn/queries/mutations/use-retry-turn";
import { TurnPerspective } from "@briom/rooms/_/turn/ui/turn-perspective";
import { TurnPerspectiveExpander } from "@briom/rooms/_/turn/ui/turn-perspective-expander";

import { FailedTurn } from "./_/failed-turn";

interface TurnRendererProps {
	isLastTurn?: boolean;
	turn: TurnDTO;
}

export function TurnRenderer({ isLastTurn, turn }: TurnRendererProps) {
	const retryMutation = useRetryTurnMutation();

	const content = turn.perspective.content;
	const hasContent = content.trim().length > 0;

	const isFailed = turn.status === "failed";
	const isPending = turn.status === "pending";
	const isStreaming = turn.status === "streaming";
	const isRetrying = retryMutation.isPending || isPending || isStreaming;

	if (!hasContent) {
		if (isFailed) {
			return (
				<FailedTurn
					error={turn.error?.message ?? "Unknown error"}
					isRetrying={isRetrying}
					onRetried={() => retryMutation.mutate({ turnId: turn.id })}
					title="Perspective was not generated"
				/>
			);
		}

		return (
			<div className="mt-4 flex items-center gap-4">
				<Logo animate />
				<span className="text-sm italic text-muted-foreground text-shimmer">
					shaping perspective...
				</span>
			</div>
		);
	}

	if (isFailed) {
		return (
			<TurnPerspectiveExpander
				className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
				defaultCollapsed={!isLastTurn}
			>
				<TurnPerspective content={content} />
				<FailedTurn
					error={turn.error?.message ?? "Unknown error"}
					isRetrying={isRetrying}
					onRetried={() => retryMutation.mutate({ turnId: turn.id })}
					title="Perspective was not fully generated"
				/>
			</TurnPerspectiveExpander>
		);
	}

	return (
		<TurnPerspectiveExpander
			className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
			defaultCollapsed={!isLastTurn}
			isStreaming={isStreaming}
		>
			<TurnPerspective content={content} />
			{isStreaming && <Logo animate className="mt-4" />}
		</TurnPerspectiveExpander>
	);
}
