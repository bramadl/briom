"use client";

import { useCallback, useEffect, useRef } from "react";

const BOTTOM_THRESHOLD_PX = 100;

export function useStickToBottom<T extends HTMLDivElement>() {
	const containerRef = useRef<T | null>(null);
	const isNearBottomRef = useRef(true);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
		const el = containerRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior });
	}, []);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const handleScroll = () => {
			const distanceFromBottom =
				el.scrollHeight - el.scrollTop - el.clientHeight;

			isNearBottomRef.current = distanceFromBottom <= BOTTOM_THRESHOLD_PX;
		};

		// Establish initial state — a room opened already scrolled to the
		// bottom (the common case) should start "stuck."
		handleScroll();

		el.addEventListener("scroll", handleScroll, { passive: true });

		const resizeObserver = new ResizeObserver(() => {
			if (isNearBottomRef.current) scrollToBottom();
		});

		resizeObserver.observe(el);

		return () => {
			el.removeEventListener("scroll", handleScroll);
			resizeObserver.disconnect();
		};
	}, [scrollToBottom]);

	return { containerRef, scrollToBottom };
}
