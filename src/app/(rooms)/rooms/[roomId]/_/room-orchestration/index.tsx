"use client";

import { useRoomScroller } from "@briom/rooms/_/room/hooks/use-room-scroller";
import { useRoomSSE } from "@briom/rooms/_/room/hooks/use-room-sse";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useState } from "react";

import { RoomLoader } from "./_/room-loader";
import { RoomScroller } from "./_/room-scroller";

const RoomDeliberation = dynamic(
	async () => (await import("./_/room-deliberation")).RoomDeliberation,
	{ loading: RoomLoader, ssr: false },
);

export function RoomOrchestration() {
	const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
	const { isNearBottomRef, scrollToBottom, showScrollButton } = useRoomScroller(
		{ scroller },
	);

	const scrollInstantly = () => scrollToBottom("instant");
	const scrollSmoothly = () => scrollToBottom("smooth");

	const { roomId } = useParams<{ roomId: string }>();
	useRoomSSE({ onTurnInitiated: scrollSmoothly, roomId });

	return (
		<section className="relative min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			<RoomDeliberation
				isNearBottomRef={isNearBottomRef}
				onLoaded={scrollInstantly}
				onScrollerLoaded={(el) => setScroller(el)}
				onStreaming={scrollInstantly}
				onTurnRegistered={scrollSmoothly}
			>
				<RoomScroller onClicked={scrollSmoothly} show={showScrollButton} />
			</RoomDeliberation>
		</section>
	);
}
