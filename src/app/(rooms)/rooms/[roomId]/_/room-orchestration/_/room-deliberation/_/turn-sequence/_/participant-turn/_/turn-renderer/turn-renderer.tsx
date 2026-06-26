"use client";

import type { RoomDeliberationTurnDTO } from "@briom/app";
import { Logo } from "@briom/components/logo";
import { useRetryTurnMutation } from "@briom/rooms/_/turn/mutations/use-retry-turn.mutation";
import { TurnPerspective } from "@briom/rooms/_/turn/ui/turn-perspective";
import { TurnPerspectiveExpander } from "@briom/rooms/_/turn/ui/turn-perspective-expander";

import { FailedTurn } from "./_/failed-turn";

interface TurnRendererProps {
	content: string;
	isFailed: boolean;
	isLastTurn?: boolean;
	isPending: boolean;
	isRetryable?: boolean;
	isStreaming: boolean;
	showAbort?: boolean;
	turn: RoomDeliberationTurnDTO;
}

export function TurnRenderer({
	content,
	isFailed,
	isLastTurn,
	isPending,
	isRetryable = false,
	isStreaming,
	showAbort,
	turn,
}: TurnRendererProps) {
	const retryMutation = useRetryTurnMutation();

	const hasContent = content.trim().length > 0;
	const isRetrying = retryMutation.isPending || isPending || isStreaming;

	const retriedHandler = isRetryable
		? () => retryMutation.mutate({ turnId: turn.id })
		: undefined;

	if (!hasContent) {
		if (isFailed) {
			return (
				<FailedTurn
					error={turn.error?.message ?? "Unknown error"}
					isRetrying={isRetrying}
					onRetried={retriedHandler}
					showAbort={showAbort}
					title="Perspective was not generated"
				/>
			);
		}

		return (
			<div className="mt-4 flex items-center gap-4">
				<Logo animate />
				<span className="text-sm italic text-muted-foreground shimmer-text">
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
					onRetried={retriedHandler}
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
