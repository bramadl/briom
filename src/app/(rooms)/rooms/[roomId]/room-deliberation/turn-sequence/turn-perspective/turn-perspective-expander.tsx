"use client";

import { cn } from "@briom/libs/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COLLAPSED_HEIGHT = 64;
const FADE_START_PERCENT = 1;

interface TurnPerspectiveExpanderProps {
	children: React.ReactNode;
	className?: string;
	collapsedHeight?: number;
	defaultCollapsed?: boolean;
	/**
	 * @description
	 * True while the wrapped content is actively growing from an LLM
	 * stream. When true, this component renders `children` at natural,
	 * unconstrained height — no `maxHeight`, no `overflow-clip`, no
	 * collapse/expand affordance.
	 *
	 * **Why streaming content can't use the measure-then-constrain approach**
	 * The collapse/fade behavior works by measuring `scrollHeight` then
	 * clamping `maxHeight` to it. That's correct for a toggle (content
	 * size is stable; only the constraint changes), but it actively fights
	 * content that's still growing: measurement is necessarily one step
	 * behind the DOM (a `ResizeObserver` callback fires asynchronously,
	 * batched to roughly once per frame), so during a fast token burst the
	 * rendered content can outgrow the last-measured `maxHeight` before the
	 * next measurement lands — and with `overflow-clip` applied, that gap
	 * shows up as visibly cut-off text, not just a late-arriving fade.
	 * Skipping the constraint entirely while streaming removes the race
	 * instead of trying to win it.
	 */
	isStreaming?: boolean;
}

/**
 * @description
 * Measures content height to drive the collapse/expand fade.
 *
 * **Why this no longer measures on every `children` change**
 * An earlier version ran a `useLayoutEffect` keyed on `children` that
 * synchronously read `ref.current.scrollHeight` on every render — during
 * active token streaming that's a forced layout read on essentially every
 * frame, which produces visible jank/stutter while text is arriving. It
 * was also redundant: a `ResizeObserver` on the same element was already
 * firing for the same size changes.
 *
 * This version relies solely on the `ResizeObserver`, throttled to once
 * per animation frame — but see `isStreaming` above for why even that
 * isn't applied to actively-streaming content.
 */
export function TurnPerspectiveExpander({
	children,
	collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
	defaultCollapsed = true,
	className,
	isStreaming = false,
}: TurnPerspectiveExpanderProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [expanded, setExpanded] = useState(!defaultCollapsed);
	const [fullHeight, setFullHeight] = useState<number | null>(null);
	const rafRef = useRef<number | null>(null);

	const measure = useCallback(() => {
		if (!ref.current) return;
		setFullHeight(ref.current.scrollHeight);
	}, []);

	useEffect(() => {
		// While streaming, height is intentionally unconstrained (see
		// `isStreaming` doc above) — no need to observe size changes we're
		// not going to act on. Re-measurement kicks back in once the turn
		// settles and this effect re-runs.
		if (isStreaming || !ref.current) return;

		// Measure once up front (e.g. a turn that arrives already settled,
		// or right when streaming finishes).
		measure();

		const observer = new ResizeObserver(() => {
			if (rafRef.current !== null) return;
			rafRef.current = requestAnimationFrame(() => {
				rafRef.current = null;
				measure();
			});
		});

		observer.observe(ref.current);
		return () => {
			observer.disconnect();
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [measure, isStreaming]);

	useEffect(() => {
		setExpanded(!defaultCollapsed);
	}, [defaultCollapsed]);

	const overflowing =
		!isStreaming && fullHeight !== null && fullHeight > collapsedHeight + 1;
	const showFade = overflowing && !expanded;

	const maxHeight = isStreaming
		? undefined
		: expanded
			? (fullHeight ?? undefined)
			: overflowing
				? collapsedHeight
				: undefined;

	const maskImage = showFade
		? `linear-gradient(to bottom, black ${FADE_START_PERCENT}%, transparent 100%)`
		: undefined;

	return (
		<div className="relative">
			<div
				className={cn(
					"overflow-clip transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none",
					isStreaming && "transition-none",
					className,
				)}
				ref={ref}
				style={{ maxHeight, maskImage, WebkitMaskImage: maskImage }}
			>
				{children}
			</div>
			{overflowing && (
				<button
					className="mt-1.5 flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
					onClick={() => setExpanded((v) => !v)}
					type="button"
				>
					{expanded ? "Show less" : "Show more"}
					{expanded ? (
						<ChevronUp className="size-3" />
					) : (
						<ChevronDown className="size-3" />
					)}
				</button>
			)}
		</div>
	);
}
