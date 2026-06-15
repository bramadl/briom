"use client";

import type { ParticipantDTO, TurnDTO } from "@briom/core/application";
import { cn } from "@briom/libs/utils";
import { useEffect, useRef } from "react";

import { ConversationMessage } from "../conversation-message";
import { StreamingMessage } from "../conversation-message/streaming-message";
import { ThinkingIndicator } from "../conversation-message/thinking-indicator";
import { SuggestionBubbles } from "../suggestion-bubbles";

import { EmptyConversation } from "./empty-conversation";

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: watches as streaming output changes
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		if (isFirstRender.current) {
			isFirstRender.current = false;
			el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
			return;
		}

		if (generating && isNearBottomRef.current) {
			el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
		}
	}, [generating, streamingContent]);

	const isEmpty = turns.length === 0 && !generating;

	return (
		<div
			className={cn(
				"flex-1 overflow-y-auto p-4 md:p-8 px-8 md:px-16",
				isEmpty && "flex flex-col",
				className,
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
	);
}
