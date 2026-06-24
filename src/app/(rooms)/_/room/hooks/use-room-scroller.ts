import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 128;

interface UseRoomScrollerOptions {
	scroller: HTMLDivElement | null;
	threshold?: number;
}

export function useRoomScroller({
	scroller,
	threshold = SCROLL_THRESHOLD,
}: UseRoomScrollerOptions) {
	const isNearBottomRef = useRef<boolean>(true);
	const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
	const scrollToBottom = useCallback(
		(behavior: ScrollBehavior = "smooth") => {
			const el = scroller;
			if (!el) return;
			el.scrollTo({ top: el.scrollHeight, behavior });
		},
		[scroller],
	);

	const checkScrollPosition = useCallback(() => {
		const el = scroller;
		if (!el) return;

		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		const nearBottom = distanceFromBottom < threshold;

		isNearBottomRef.current = nearBottom;
		setShowScrollButton(!nearBottom);
	}, [scroller, threshold]);

	useEffect(() => {
		const el = scroller;
		if (!el) return;

		el.addEventListener("scroll", checkScrollPosition, { passive: true });
		return () => el.removeEventListener("scroll", checkScrollPosition);
	}, [checkScrollPosition, scroller]);

	return {
		isNearBottomRef,
		scroller,
		scrollToBottom,
		showScrollButton,
	};
}
