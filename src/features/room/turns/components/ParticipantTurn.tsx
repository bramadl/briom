"use client";

import { Logo } from "@briom/components/logo";
import { Badge } from "@briom/components/ui/badge";
import type { TurnIntent } from "@briom/core/domain";
import { useSmoothedStreamText } from "@briom/hooks/use-streaming";
import { cn } from "@briom/libs/utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { getParticipantTheme } from "@briom/room/participant/settings/theme";
import {
	useIsTurnExpanded,
	useTurnCollapseStore,
} from "@briom/room/turns/hooks/use-turn-collapse-store";
import { memo, useCallback, useMemo } from "react";

import { useRetryTurnMutation } from "../hooks/use-retry-turn-mutation";
import { useTurnStreaming } from "../hooks/use-turn-streaming";
import { TurnActions } from "./internal/TurnActions";
import { TurnContent } from "./internal/TurnContent";
import { TurnContentCollapser } from "./internal/TurnContentCollapser";
import { TurnFailed } from "./internal/TurnFailed";

interface ParticipantProfileProps {
	displayName: string;
	intent: TurnIntent | null;
	isStreaming: boolean;
	model: string;
	participantId: string;
}

function ParticipantProfile({
	displayName,
	intent,
	isStreaming,
	model,
	participantId,
}: ParticipantProfileProps) {
	const theme = getParticipantTheme(participantId);

	return (
		<div className="flex flex-col mb-2">
			<div className="flex items-center gap-2">
				<span className={cn("text-sm font-medium font-serif", theme.text)}>
					{displayName}
				</span>
				<Badge
					className={cn(
						"text-[10px] uppercase tracking-wide px-2 py-0 h-4 border-border/50 text-muted-foreground font-mono",
						isStreaming && "opacity-60",
					)}
					variant="outline"
				>
					{isStreaming ? "writing" : (intent ?? "—")}
				</Badge>
			</div>
			<span className="text-xs text-muted-foreground">{model}</span>
		</div>
	);
}

interface ParticipantTurnProps {
	/**
	 * @description
	 * The ID of this turn — still the only prop this takes. Whether
	 * it's live or settled, its content, and its expanded state are all
	 * resolved internally. There is deliberately no more Live/Static
	 * split: that split was the cause of a visible empty-card gap the
	 * instant a turn settled, because unmounting the live subtree and
	 * mounting a fresh static one meant a render (or several, waiting
	 * on the room refetch) with neither streaming content NOR settled
	 * content available. `useTurnStreaming` now owns bridging that gap
	 * — see its doc comment — so this component just renders "whatever
	 * content is currently the best available" continuously, with no
	 * unmount/remount seam between phases.
	 */
	id: string;
}

/**
 * @description
 * Single rendering path for a turn, live or settled. `memo`-wrapped so
 * that, across `RoomSequence`'s `turns.map()`, only the instance whose
 * own scalar selectors actually changed (`useIsTurnExpanded(id)`, and
 * whatever `useTurnStreaming` internally selects) re-renders — this
 * still holds because the only prop is `id`, unchanged across renders
 * for every other turn in the list.
 */
export const ParticipantTurn = memo(function ParticipantTurn({
	id,
}: ParticipantTurnProps) {
	const { room, roomId } = useRoom();

	const isExpanded = useIsTurnExpanded(id);
	const toggleExpanded = useTurnCollapseStore((s) => s.toggleExpanded);

	const retryMutation = useRetryTurnMutation(roomId);
	const retry = useCallback(() => {
		retryMutation.mutate({ roomId, turnId: id });
	}, [retryMutation.mutate, roomId, id]);

	const turn = useMemo(
		() => room.info.turns.find((t) => t.id === id),
		[room.info.turns, id],
	);

	const { content, status, error, isActive, isStreaming } = useTurnStreaming({
		turnId: id,
		settledContent: turn?.content,
	});

	const smoothedContent = useSmoothedStreamText(content, isStreaming);

	if (turn?.author.type !== "participant") return null;
	const { profile } = turn.author;
	if (!profile.participant) return null;

	const theme = getParticipantTheme(profile.participant.id);

	const isFailed = isActive ? status === "failed" : turn.status === "failed";
	const isCollapsed = !isExpanded;

	const failureReason = isActive ? error?.message : turn.error?.message;
	const onRetried = !isActive ? retry : undefined;

	return (
		<div className="relative group space-y-2 w-full min-w-0 rounded-lg" id={id}>
			<div className={cn("relative pl-4 border-l-2", theme.border)}>
				<ParticipantProfile
					displayName={profile.participant.name}
					intent={turn.intent}
					isStreaming={isStreaming}
					model={profile.participant.model}
					participantId={profile.participant.id}
				/>

				{isFailed ? (
					<>
						{content.length > 0 && (
							<TurnContentCollapser
								className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
								isCollapsed={isCollapsed}
								onToggled={() => toggleExpanded(id)}
							>
								<TurnContent content={content} />
							</TurnContentCollapser>
						)}
						<TurnFailed
							label={
								isActive
									? "Perspective was not generated"
									: "Perspective was not fully generated"
							}
							onRetried={onRetried}
							reason={failureReason ?? "Unknown error."}
						/>
					</>
				) : content.length === 0 ? (
					<div className="mt-4 flex items-center gap-4">
						<Logo animate />
						<span className="text-sm italic text-muted-foreground shimmer-text">
							{status === "pending"
								? "thinking for a moment..."
								: "shaping perspective..."}
						</span>
					</div>
				) : isActive ? (
					<div className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert">
						<TurnContent content={smoothedContent} />
						{isStreaming && <Logo animate className="mt-4" />}
					</div>
				) : (
					<TurnContentCollapser
						className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert"
						isCollapsed={isCollapsed}
						onToggled={() => toggleExpanded(id)}
					>
						<TurnContent content={content} />
					</TurnContentCollapser>
				)}
			</div>
			{!isActive && turn.settledAt && (
				<TurnActions
					content={content}
					isModerator={false}
					settledAt={turn.settledAt}
				/>
			)}
		</div>
	);
});
