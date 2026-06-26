import { useCallback, useEffect, useRef, useState } from "react";

const NEAR_BOTTOM_THRESHOLD = 200;

interface UseRoomScrollerOptions {
	scroller: HTMLDivElement | null;
}

interface UseRoomScrollerReturn {
	isNearBottomRef: React.RefObject<boolean>;
	scrollIfNearBottom: () => void;
	scrollToBottom: (behavior?: ScrollBehavior) => void;
	showScrollButton: boolean;
}

export function useRoomScroller({
	scroller,
}: UseRoomScrollerOptions): UseRoomScrollerReturn {
	const isNearBottomRef = useRef<boolean>(true);
	const [showScrollButton, setShowScrollButton] = useState(false);

	const scrollToBottom = useCallback(
		(behavior: ScrollBehavior = "smooth") => {
			if (!scroller) return;
			scroller.scrollTo({ top: scroller.scrollHeight, behavior });
		},
		[scroller],
	);

	const scrollIfNearBottom = useCallback(() => {
		if (isNearBottomRef.current) scrollToBottom("instant");
	}, [scrollToBottom]);

	useEffect(() => {
		if (!scroller) return;

		const handleScroll = () => {
			const distanceFromBottom =
				scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;

			const nearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
			isNearBottomRef.current = nearBottom;
			setShowScrollButton(!nearBottom);
		};

		scroller.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => scroller.removeEventListener("scroll", handleScroll);
	}, [scroller]);

	return {
		isNearBottomRef,
		scrollIfNearBottom,
		scrollToBottom,
		showScrollButton,
	};
}
