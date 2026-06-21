"use client";

import { cn } from "@briom/libs/utils";
import { useEffect, useMemo } from "react";

import { useRoomScroller } from "../room-panel/use-room-scroller";

import { ModeratorInput } from "./moderator-input";
import { RoomDeliberationOverlay } from "./room-deliberation-overlay";
import { RoomScrollerButton } from "./room-scroller/room-scroller-button";
import { EmptySequence, TurnSequence } from "./turn-sequence";
import { useRoomDeliberation } from "./use-room-deliberation";

export function RoomDeliberation() {
	const {
		ready,
		isFreshRoom,
		isMultiDeliberationRoom,
		isStreaming,
		moderatorHint,
		participants,
		sequenceTurns,
		turns,
	} = useRoomDeliberation();

	const { isNearBottomRef, scrollRef, showScrollButton, scrollToBottom } =
		useRoomScroller();

	const lastTurnContentLength = useMemo(() => {
		return turns.at(-1)?.perspective.content.length ?? 0;
	}, [turns]);

	useEffect(() => {
		if (ready) scrollToBottom("instant");
	}, [ready, scrollToBottom]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: watches streamed content
	useEffect(() => {
		if (!isNearBottomRef.current) return;
		scrollToBottom("instant");
	}, [
		isNearBottomRef.current,
		scrollToBottom,
		turns.length,
		lastTurnContentLength,
	]);

	return (
		<section className="relative min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			{!ready && <RoomDeliberationOverlay />}
			<div
				className={cn(
					"flex-1 flex flex-col gap-8 p-8 py-10 min-w-0 min-h-0 overflow-y-auto no-scrollbar",
					"opacity-0 transition-opacity duration-500 ease-out",
					ready && "opacity-100",
				)}
				ref={scrollRef}
			>
				{isFreshRoom ? <EmptySequence /> : <TurnSequence />}
			</div>
			<RoomScrollerButton
				onClicked={() => scrollToBottom("smooth")}
				show={showScrollButton}
			/>
			<div
				className={cn(
					"sticky bottom-0 z-10 shrink-0 p-8 pt-0 opacity-0 transition-opacity duration-500 ease-out",
					ready && "opacity-100",
				)}
			>
				<ModeratorInput
					canEdit={!isStreaming}
					canMention={isMultiDeliberationRoom}
					isStreaming={isStreaming}
					onSend={async (content, mentionees) => {
						await sequenceTurns(content, mentionees);
						scrollToBottom("smooth");
					}}
					participants={participants}
					placeholder={moderatorHint}
				/>
			</div>
		</section>
	);
}
