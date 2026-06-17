"use client";

import type { ParticipantDTO, TurnDTO } from "@briom/core/application";
import { cn } from "@briom/libs/utils";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { ConversationMessage } from "../conversation-message";
import { StreamingMessage } from "../conversation-message/streaming-message";
import { ThinkingIndicator } from "../conversation-message/thinking-indicator";
import type { StreamPhase } from "../stream-experience/types";
import { SuggestionBubbles } from "../suggestion-bubbles";
import { EmptyConversation } from "./empty-conversation";
import { ScrollToBottom } from "./scroll-to-bottom";

const SCROLL_THRESHOLD = 120;

interface ConversationTimelineProps {
	className?: string;
	generating?: boolean;
	onSuggestionSelected: (participantId: string, intent: string) => void;
	onTimelineReady: () => void;
	participants: ParticipantDTO[];
	streamingContent?: string;
	streamingParticipantId?: string | null;
	streamPhase: StreamPhase;
	turns: TurnDTO[];
}

export function ConversationTimeline({
	className,
	generating,
	onSuggestionSelected,
	onTimelineReady,
	participants,
	streamingContent,
	streamingParticipantId,
	streamPhase,
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

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTo({
			top: el.scrollHeight,
			behavior,
		});
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
	const mountHandler = () => {
		scrollToBottom("instant");
		onTimelineReady();
	};

	return (
		<div className={cn("relative flex-1 w-full min-h-0", className)}>
			<ScrollToBottom
				onClicked={() => scrollToBottom("smooth")}
				show={showScrollButton}
			/>
			<div className="h-full py-8 overflow-y-auto" ref={scrollRef}>
				<div className="flex flex-col gap-4 md:gap-8 px-16 md:px-24 max-w-4xl mx-auto">
					{isEmpty ? (
						<EmptyConversation participants={participants} />
					) : (
						<Fragment>
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
										onMounted={mountHandler}
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
									phase={streamingContent ? "streaming" : streamPhase}
								/>
							)}

							{lastTurn && !generating && (
								<SuggestionBubbles
									lastTurn={lastTurn}
									onSelect={onSuggestionSelected}
									participants={participants}
								/>
							)}
						</Fragment>
					)}
				</div>
			</div>
		</div>
	);
}
