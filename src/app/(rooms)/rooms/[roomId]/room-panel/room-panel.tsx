"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RoomScrollerContext } from "./room-scroller.context";

const SCROLL_THRESHOLD = 120;

export function RoomPanel({ children }: React.PropsWithChildren) {
	const isNearBottomRef = useRef<boolean>(true);
	const scrollRef = useRef<HTMLDivElement | null>(null);

	const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior });
	}, []);

	const checkScrollPosition = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;

		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		const nearBottom = distanceFromBottom < SCROLL_THRESHOLD;

		isNearBottomRef.current = nearBottom;
		setShowScrollButton(!nearBottom);
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		el.addEventListener("scroll", checkScrollPosition, { passive: true });
		return () => el.removeEventListener("scroll", checkScrollPosition);
	}, [checkScrollPosition]);

	return (
		<RoomScrollerContext.Provider
			value={{ isNearBottomRef, scrollRef, scrollToBottom, showScrollButton }}
		>
			<div className="flex flex-1 items-start min-w-0 overflow-hidden">
				{children}
			</div>
		</RoomScrollerContext.Provider>
	);
}
