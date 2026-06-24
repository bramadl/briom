"use client";

import { useDeliberation } from "@briom/rooms/_/deliberation/use-deliberation";
import { useEffect, useMemo } from "react";

import { EmptySequence } from "./_/empty-sequence";
import { ModeratorInput } from "./_/moderator-input";
import { TurnSequence } from "./_/turn-sequence";

interface RoomDeliberationProps extends React.PropsWithChildren {
	isNearBottomRef: React.RefObject<boolean>;
	onLoaded?: () => void;
	onScrollerLoaded?: (el: HTMLDivElement | null) => void;
	onStreaming?: () => void;
	onTurnRegistered?: () => void;
}

export function RoomDeliberation({
	children,
	isNearBottomRef,
	onLoaded,
	onStreaming,
	onScrollerLoaded,
	onTurnRegistered,
}: RoomDeliberationProps) {
	const {
		abortStreaming,
		acceptProposal,
		fresh: isFreshRoom,
		isConcluded,
		isParticipantActive,
		isSendingModerator,
		isSequencing,
		multiDeliberation: isMultiDeliberationRoom,
		participants,
		proposals,
		sequenceTurns,
		turns,
	} = useDeliberation();

	const lastTurnContentLength = useMemo(
		() => turns.at(-1)?.perspective.content.length ?? 0,
		[turns],
	);

	useEffect(() => {
		if (
			isNearBottomRef.current &&
			isParticipantActive &&
			lastTurnContentLength > 0
		) {
			onStreaming?.();
		}
	}, [
		isNearBottomRef,
		isParticipantActive,
		lastTurnContentLength,
		onStreaming,
	]);

	useEffect(() => {
		onLoaded?.();
	}, [onLoaded]);

	return (
		<section className="relative min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			<div
				className="flex-1 flex flex-col gap-8 p-8 lg:py-16 min-w-0 min-h-0 overflow-y-auto no-scrollbar overflow-x-hidden"
				ref={onScrollerLoaded}
			>
				{isFreshRoom ? (
					<EmptySequence />
				) : (
					<TurnSequence
						onProposalAccepted={acceptProposal}
						proposals={proposals}
						showProposals={!isSequencing}
					/>
				)}
			</div>
			{children}
			{!isConcluded && (
				<div className="sticky bottom-0 z-10 shrink-0 p-8 pt-0">
					<ModeratorInput
						canEdit={!isSequencing}
						canMention={isMultiDeliberationRoom}
						isPending={isSendingModerator}
						isStreaming={isParticipantActive}
						onAbort={abortStreaming}
						onSend={(content, mentionees) => {
							sequenceTurns(content, mentionees);
							onTurnRegistered?.();
						}}
						participants={participants}
					/>
				</div>
			)}
		</section>
	);
}
