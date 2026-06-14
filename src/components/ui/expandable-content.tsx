"use client";

import { cn } from "@briom/libs/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Roughly how tall the "preview" should be before content gets clamped.
 * At `text-sm` + `leading-relaxed`, ~200px ≈ 8-9 lines.
 */
const DEFAULT_COLLAPSED_HEIGHT = 64;

/** Where the fade-to-transparent mask starts, as % of the collapsed height. */
const FADE_START_PERCENT = 1;

interface ExpandableContentProps {
	children: React.ReactNode;
	className?: string;
	collapsedHeight?: number;
	defaultCollapsed?: boolean;
}

/**
 * Clamps long content to `collapsedHeight`, fading it out with a mask,
 * and reveals a "Show more / Show less" toggle only if the content
 * actually overflows that height.
 *
 * Designed for rendered markdown / rich content — clips the rendered
 * DOM rather than the source string, so nothing breaks mid-element.
 */
export function ExpandableContent({
	children,
	collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
	defaultCollapsed = true,
	className,
}: ExpandableContentProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [expanded, setExpanded] = useState(!defaultCollapsed);
	const [fullHeight, setFullHeight] = useState<number | null>(null);

	const measure = () => {
		if (!ref.current) return;
		setFullHeight(ref.current.scrollHeight);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: Run before paint so ot never flashes unclamped content.
	useLayoutEffect(() => {
		measure();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [children]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Re-measure if the container resizes.
	useEffect(() => {
		if (!ref.current) return;
		const observer = new ResizeObserver(measure);
		observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	const overflowing = fullHeight !== null && fullHeight > collapsedHeight + 1;
	const showFade = overflowing && !expanded;

	const maskImage = showFade
		? `linear-gradient(to bottom, black ${FADE_START_PERCENT}%, transparent 100%)`
		: undefined;

	return (
		<div className="relative">
			<div
				className={cn(
					"overflow-clip transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none",
					className,
				)}
				ref={ref}
				style={{
					maxHeight: overflowing
						? expanded
							? (fullHeight ?? undefined)
							: collapsedHeight
						: undefined,
					maskImage,
					WebkitMaskImage: maskImage,
				}}
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
