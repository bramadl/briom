"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const BOTTOM_THRESHOLD_PX = 128;

export function useStickToBottom<T extends HTMLDivElement = HTMLDivElement>() {
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const isNearBottomRef = useRef(true);

	const [contentNode, setContentNode] = useState<T | null>(null);
	const contentRef = useCallback((node: T | null) => setContentNode(node), []);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
		const el = scrollContainerRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior });
	}, []);

	const forceScrollToBottom = useCallback(
		(behavior: ScrollBehavior = "smooth") => {
			isNearBottomRef.current = true;

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					scrollToBottom(behavior);
				});
			});
		},
		[scrollToBottom],
	);

	useEffect(() => {
		const el = scrollContainerRef.current;
		if (!el) return;

		const handleScroll = () => {
			const { clientHeight, scrollHeight, scrollTop } = el;
			const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
			isNearBottomRef.current = distanceFromBottom <= BOTTOM_THRESHOLD_PX;
		};

		handleScroll();
		el.addEventListener("scroll", handleScroll, { passive: true });
		return () => el.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (!contentNode) return;

		const resizeObserver = new ResizeObserver(() => {
			if (isNearBottomRef.current) scrollToBottom();
		});

		resizeObserver.observe(contentNode);
		scrollToBottom();

		return () => resizeObserver.disconnect();
	}, [contentNode, scrollToBottom]);

	return {
		contentRef,
		forceScrollToBottom,
		scrollContainerRef,
		scrollToBottom,
	};
}
