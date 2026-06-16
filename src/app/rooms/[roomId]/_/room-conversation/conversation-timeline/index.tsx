"use client";

import { Button } from "@briom/components/ui/button";
import type { ParticipantDTO, TurnDTO } from "@briom/core/application";
import { cn } from "@briom/libs/utils";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConversationMessage } from "../conversation-message";
import { StreamingMessage } from "../conversation-message/streaming-message";
import { ThinkingIndicator } from "../conversation-message/thinking-indicator";
import { SuggestionBubbles } from "../suggestion-bubbles";

import { EmptyConversation } from "./empty-conversation";

const SCROLL_THRESHOLD = 120;

interface ConversationTimelineProps {
	className?: string;
	generating?: boolean;
	onSuggestionSelected: (participantId: string, intent: string) => void;
	participants: ParticipantDTO[];
	streamingContent?: string;
	streamingParticipantId?: string | null;
	turns: TurnDTO[];
}

export function ConversationTimeline({
	className,
	generating,
	onSuggestionSelected,
	participants,
	streamingContent,
	streamingParticipantId,
	turns,
}: ConversationTimelineProps) {
	const participantIndexMap = new Map(participants.map((p, i) => [p.id, i]));
	const lastTurn = turns.at(-1);

	const streamingParticipant = streamingParticipantId
		? participants.find((p) => p.id === streamingParticipantId)
		: undefined;

	const streamingParticipantIndex = streamingParticipant
		? (participantIndexMap.get(streamingParticipant.id) ?? 0)
		: 0;

	const scrollRef = useRef<HTMLDivElement>(null);
	const isFirstRender = useRef(true);
	const isNearBottomRef = useRef(true);
	const [showScrollButton, setShowScrollButton] = useState(false);

	const checkScrollPosition = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;

		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		const nearBottom = distanceFromBottom < SCROLL_THRESHOLD;

		isNearBottomRef.current = nearBottom;
		setShowScrollButton(!nearBottom);
	}, []);

	const scrollToBottom = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		el.addEventListener("scroll", checkScrollPosition, { passive: true });
		return () => el.removeEventListener("scroll", checkScrollPosition);
	}, [checkScrollPosition]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: watches as streaming output changes
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		if (isFirstRender.current) {
			isFirstRender.current = false;
			el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
			checkScrollPosition();
			return;
		}

		if (generating && isNearBottomRef.current) {
			el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
		}
	}, [generating, streamingContent, checkScrollPosition]);

	// (new message might push content)
	// biome-ignore lint/correctness/useExhaustiveDependencies: Re-check when turns change
	useEffect(() => {
		checkScrollPosition();
	}, [turns.length, checkScrollPosition]);

	const isEmpty = turns.length === 0 && !generating;

	return (
		<div className={cn("relative flex-1 min-h-0", className)}>
			<div
				className={cn(
					"h-full overflow-y-auto p-4 md:p-8 px-8 md:px-16",
					isEmpty && "flex flex-col",
				)}
				ref={scrollRef}
			>
				{isEmpty ? (
					<EmptyConversation participants={participants} />
				) : (
					<div className="max-w-2xl mx-auto flex flex-col gap-4 md:gap-8">
						{turns.map((turn) => {
							const participant = participants.find(
								(p) => p.id === turn.participantId,
							);
							const participantIndex = turn.participantId
								? (participantIndexMap.get(turn.participantId) ?? 0)
								: 0;

							return (
								<ConversationMessage
									isLatestTurn={turn.id === lastTurn?.id}
									key={turn.id}
									participant={participant}
									participantIndex={participantIndex}
									turn={turn}
								/>
							);
						})}

						{generating && streamingContent && (
							<StreamingMessage
								content={streamingContent}
								participant={streamingParticipant}
								participantIndex={streamingParticipantIndex}
							/>
						)}

						{generating && !streamingContent && (
							<ThinkingIndicator
								name={streamingParticipant?.displayName ?? "AI"}
							/>
						)}

						{lastTurn && !generating && (
							<SuggestionBubbles
								lastTurn={lastTurn}
								onSelect={onSuggestionSelected}
								participants={participants}
							/>
						)}
					</div>
				)}
			</div>

			{/* Floating scroll-to-bottom button */}
			<div
				className={cn(
					"absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10 transition-all duration-300",
					showScrollButton
						? "translate-y-0 opacity-100"
						: "translate-y-4 opacity-0 pointer-events-none",
				)}
			>
				<Button
					className="h-9 w-9 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm"
					onClick={scrollToBottom}
					size="icon"
					variant="default"
				>
					<ArrowDown className="size-4" />
					<span className="sr-only">Scroll to bottom</span>
				</Button>
			</div>
		</div>
	);
}
