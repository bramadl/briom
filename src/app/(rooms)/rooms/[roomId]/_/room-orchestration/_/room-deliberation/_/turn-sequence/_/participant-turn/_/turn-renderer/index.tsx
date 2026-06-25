/**
 * @file turn-renderer/index.tsx
 * @path src/app/(rooms)/rooms/[roomId]/_/room-orchestration/_/room-deliberation/_/turn-sequence/_/participant-turn/_/turn-renderer/index.tsx
 *
 * ## Streaming Optimization
 *
 * Accepts `content`, `isFailed`, `isPending`, `isStreaming` as explicit props
 * instead of deriving them from `turn.status` / `turn.content`. This allows
 * the parent `ParticipantTurn` to inject live values from the Zustand stream
 * store without this component needing to know where data comes from.
 */

"use client";

import type { RoomDeliberationTurnDTO } from "@briom/app";
import { Logo } from "@briom/components/logo";
import { useRetryTurnMutation } from "@briom/rooms/_/turn/mutations/use-retry-turn.mutation";
import { TurnPerspective } from "@briom/rooms/_/turn/ui/turn-perspective";
import { TurnPerspectiveExpander } from "@briom/rooms/_/turn/ui/turn-perspective-expander";

import { FailedTurn } from "./_/failed-turn";

interface TurnRendererProps {
	/** Live content from stream store (or settled content from query cache) */
	content: string;
	isFailed: boolean;
	isLastTurn?: boolean;
	isPending: boolean;
	isStreaming: boolean;
	showAbort?: boolean;
	/** Original turn object — used only for error details and retry ID */
	turn: RoomDeliberationTurnDTO;
}

export function TurnRenderer({
	content,
	isFailed,
	isLastTurn,
	isPending,
	isStreaming,
	showAbort,
	turn,
}: TurnRendererProps) {
	const retryMutation = useRetryTurnMutation();

	const hasContent = content.trim().length > 0;
	const isRetrying = retryMutation.isPending || isPending || isStreaming;

	if (!hasContent) {
		if (isFailed) {
			return (
				<FailedTurn
					error={turn.error?.message ?? "Unknown error"}
					isRetrying={isRetrying}
					onRetried={() => retryMutation.mutate({ turnId: turn.id })}
					showAbort={showAbort}
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
