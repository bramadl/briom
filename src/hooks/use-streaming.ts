"use client";

import { useEffect, useRef, useState } from "react";

const MIN_CHARS_PER_TICK = 2;
const BASE_CHARS_PER_TICK = 3;
const CATCH_UP_THRESHOLD = 40;

/**
 * @description
 * Reveal ticks are plain, synchronous `setState` — deliberately NOT
 * wrapped in `startTransition`. Transitions are for expensive,
 * droppable work; the reveal itself must never be dropped, or every
 * tick that loses the race to the next rAF frame vanishes instead of
 * just being delayed — which is what made the previous version feel
 * like "word, long pause, word, long pause" instead of smooth.
 *
 * The actual expensive part (markdown parsing in `TurnContent`) is
 * protected separately, via `TurnContent` being wrapped in `memo` and
 * the reveal rate itself being cheap — not by dropping reveal frames.
 */
export function useSmoothedStreamText(
	targetContent: string,
	isStreaming: boolean,
): string {
	const [displayed, setDisplayed] = useState(targetContent);
	const displayedRef = useRef(targetContent);
	const targetRef = useRef(targetContent);
	targetRef.current = targetContent;
	const isStreamingRef = useRef(isStreaming);
	isStreamingRef.current = isStreaming;

	// biome-ignore lint/correctness/useExhaustiveDependencies: stable refs.
	useEffect(() => {
		if (!isStreaming) {
			displayedRef.current = targetContent;
			setDisplayed(targetContent);
			return;
		}

		let cancelled = false;
		let frame: number;

		const tick = () => {
			if (cancelled) return;
			const current = displayedRef.current;
			const target = targetRef.current;

			if (current.length < target.length) {
				const remaining = target.length - current.length;
				const charsThisTick =
					remaining > CATCH_UP_THRESHOLD
						? Math.max(MIN_CHARS_PER_TICK, Math.ceil(remaining / 6))
						: BASE_CHARS_PER_TICK;

				const next = target.slice(0, current.length + charsThisTick);
				displayedRef.current = next;
				setDisplayed(next); // synchronous — always commits
			}

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
		};
	}, [isStreaming]);

	useEffect(() => {
		if (!isStreamingRef.current && displayed !== targetContent) {
			displayedRef.current = targetContent;
			setDisplayed(targetContent);
		}
	}, [targetContent, displayed]);

	return displayed;
}
