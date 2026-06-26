"use client";

import { useRoomSSE } from "@briom/rooms/_/room/hooks/use-room-sse";
import { useRoomScroller } from "@briom/rooms/_/room/scroller/use-room-scroller";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { RoomDeliberation } from "./_/room-deliberation";
import { RoomLoader } from "./_/room-loader";
import { RoomScroller } from "./_/room-scroller";

export function RoomOrchestration() {
	const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	const {
		isNearBottomRef,
		scrollIfNearBottom,
		scrollToBottom,
		showScrollButton,
	} = useRoomScroller({ scroller });

	const { roomId } = useParams<{ roomId: string }>();
	useRoomSSE({ roomId });

	const handleLoaded = useCallback(() => {
		setIsLoaded(true);
		scrollToBottom("instant");
	}, [scrollToBottom]);

	const handleTurnRegistered = useCallback(() => {
		scrollToBottom("smooth");
	}, [scrollToBottom]);

	const handleTurnPending = useCallback(() => {
		scrollToBottom("smooth");
	}, [scrollToBottom]);

	const handleStreaming = useCallback(() => {
		scrollIfNearBottom();
	}, [scrollIfNearBottom]);

	return (
		<div className="relative min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			{!isLoaded && <RoomLoader />}
			<RoomDeliberation
				isNearBottomRef={isNearBottomRef}
				onLoaded={handleLoaded}
				onScrollerLoaded={setScroller}
				onStreaming={handleStreaming}
				onTurnPending={handleTurnPending}
				onTurnRegistered={handleTurnRegistered}
			>
				<RoomScroller
					onScrollToBottom={() => scrollToBottom("smooth")}
					show={showScrollButton}
				/>
			</RoomDeliberation>
		</div>
	);
}
