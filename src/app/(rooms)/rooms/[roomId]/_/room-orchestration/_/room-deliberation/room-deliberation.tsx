"use client";

import { useDeliberation } from "@briom/rooms/_/deliberation/hooks/use-deliberation";
import { useTurnStreamStore } from "@briom/rooms/_/deliberation/hooks/use-turn-stream.store";
import { useEffect, useRef } from "react";

import { EmptySequence } from "./_/empty-sequence";
import { ModeratorInput } from "./_/moderator-input/moderator-input";
import { TurnSequence } from "./_/turn-sequence/turn-sequence";

interface RoomDeliberationProps extends React.PropsWithChildren {
	isNearBottomRef: React.RefObject<boolean>;
	onLoaded?: () => void;
	onScrollerLoaded?: (el: HTMLDivElement | null) => void;
	onStreaming?: () => void;
	onTurnPending?: () => void;
	onTurnRegistered?: () => void;
}

export function RoomDeliberation({
	children,
	onLoaded,
	onStreaming,
	onScrollerLoaded,
	onTurnRegistered,
	onTurnPending,
}: RoomDeliberationProps) {
	const {
		abortStreaming,
		acceptProposal,
		canAcceptProposal,
		fresh: isFreshRoom,
		isConcluded,
		isParticipantActive,
		isSendingModerator,
		isSequencing,
		multiDeliberation: isMultiDeliberationRoom,
		participants,
		proposals,
		sequenceTurns,
	} = useDeliberation();

	const onStreamingRef = useRef(onStreaming);
	onStreamingRef.current = onStreaming;

	const onTurnPendingRef = useRef(onTurnPending);
	onTurnPendingRef.current = onTurnPending;

	useEffect(() => {
		return useTurnStreamStore.subscribe(
			(state) => state.turns,
			() => {
				const streamingTurnId = useTurnStreamStore.getState().streamingTurnId;
				if (streamingTurnId !== null) onStreamingRef.current?.();
			},
		);
	}, []);

	useEffect(() => {
		let prev: string | null = null;
		return useTurnStreamStore.subscribe(
			(state) => state.streamingTurnId,
			(current) => {
				if (prev === null && current !== null) {
					onTurnPendingRef.current?.();
				}
				prev = current;
			},
		);
	}, []);

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
					<EmptySequence participants={participants} />
				) : (
					<TurnSequence
						onProposalAccepted={acceptProposal}
						proposals={proposals}
						showProposals={canAcceptProposal}
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
