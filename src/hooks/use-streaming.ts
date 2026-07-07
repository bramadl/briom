"use client";

import { useEffect, useRef, useState } from "react";

/**
 * @description
 * Base interval (ms) between word reveals when we're roughly caught up
 * with the target content. This is the "resting" pace — tuned to feel
 * like a natural reading/typing rhythm, not a typewriter tick.
 */
const BASE_INTERVAL_MS = 55;

/**
 * @description
 * Floor for the interval when we're catching up on a big backlog. We
 * never go faster than this, no matter how far behind we are — a hard
 * floor avoids the old "burst dump" feeling where a big chunk would
 * flash in all at once.
 */
const MIN_INTERVAL_MS = 16;

/**
 * @description
 * Word-count backlog beyond which we start easing the interval down
 * (i.e. speeding up). Below this, we always reveal at BASE_INTERVAL_MS
 * regardless of backlog size — small, normal token bursts should never
 * trigger catch-up behavior.
 */
const CATCH_UP_THRESHOLD_WORDS = 6;

/**
 * @description
 * Backlog size (in words) at which we consider ourselves "maximally
 * behind" for the purposes of easing — beyond this the interval is
 * clamped to MIN_INTERVAL_MS. Chosen so catch-up ramps in smoothly
 * over a reasonable range instead of snapping straight to max speed.
 */
const MAX_BACKLOG_WORDS = 40;

/**
 * @description
 * Splits content into reveal-able chunks, preserving whitespace as its
 * own chunk so words re-join with their original spacing/newlines.
 * Each element is either a run of non-whitespace ("word") or a run of
 * whitespace — both are revealed as atomic units.
 */
function splitIntoChunks(content: string): string[] {
	return content.match(/\S+|\s+/g) ?? [];
}

/**
 * @description
 * Eases the reveal interval down as backlog grows, using a smoothstep
 * curve rather than a linear or raw-proportional one. This is what
 * kills the old "instant burst then dead stop" feeling: the speed-up
 * ramps in and out gradually instead of snapping.
 */
function intervalForBacklog(backlogWords: number): number {
	if (backlogWords <= CATCH_UP_THRESHOLD_WORDS) return BASE_INTERVAL_MS;

	const span = MAX_BACKLOG_WORDS - CATCH_UP_THRESHOLD_WORDS;
	const raw = (backlogWords - CATCH_UP_THRESHOLD_WORDS) / span;
	const t = Math.min(1, Math.max(0, raw));

	const eased = t * t * (3 - 2 * t);
	return BASE_INTERVAL_MS - eased * (BASE_INTERVAL_MS - MIN_INTERVAL_MS);
}

/**
 * @description
 * Reveals `targetContent` word-by-word at an adaptive-but-smoothed
 * pace, instead of dumping it in all at once or ticking it out one
 * character at a time. Whitespace (including newlines) rides along
 * with its neighboring word so paragraph/line breaks land naturally.
 *
 * Like the previous character-based version, ticks are plain
 * synchronous `setState` calls — never wrapped in `startTransition`.
 * A dropped reveal frame here means a dropped *word*, which is far
 * more noticeable than a dropped character, so every tick must commit.
 *
 * Pacing is interval-based (setTimeout) rather than rAF-driven
 * char-budgets: each tick reveals exactly one chunk (one word or one
 * whitespace run), and the *delay* before the next tick is what eases
 * up or down based on backlog. This keeps the motion itself constant
 * (one word per commit) while only the rhythm adapts — which reads as
 * "the AI is typing faster" rather than "words are being crammed in."
 */
export function useSmoothedStreamText(
	targetContent: string,
	isStreaming: boolean,
): string {
	const [displayed, setDisplayed] = useState(targetContent);

	const targetRef = useRef(targetContent);
	targetRef.current = targetContent;

	const revealedCountRef = useRef(0);
	const displayedTextRef = useRef(targetContent);

	// stable refs, intentional isStreaming-only restart
	// biome-ignore lint/correctness/useExhaustiveDependencies: –
	useEffect(() => {
		if (!isStreaming) {
			displayedTextRef.current = targetContent;
			revealedCountRef.current = splitIntoChunks(targetContent).length;
			setDisplayed(targetContent);
			return;
		}

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout>;

		const tick = () => {
			if (cancelled) return;

			const chunks = splitIntoChunks(targetRef.current);
			const revealed = revealedCountRef.current;

			if (revealed < chunks.length) {
				const backlogWords = chunks.length - revealed;
				const next = chunks.slice(0, revealed + 1).join("");

				revealedCountRef.current = revealed + 1;
				displayedTextRef.current = next;
				setDisplayed(next);

				timer = setTimeout(tick, intervalForBacklog(backlogWords));
				return;
			}

			timer = setTimeout(tick, BASE_INTERVAL_MS);
		};

		timer = setTimeout(tick, BASE_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [isStreaming]);

	useEffect(() => {
		if (!isStreaming && displayedTextRef.current !== targetContent) {
			displayedTextRef.current = targetContent;
			revealedCountRef.current = splitIntoChunks(targetContent).length;
			setDisplayed(targetContent);
		}
	}, [targetContent, isStreaming]);

	return displayed;
}
