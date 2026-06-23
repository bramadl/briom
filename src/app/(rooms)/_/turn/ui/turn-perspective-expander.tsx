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
	isStreaming?: boolean;
}

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
		if (isStreaming || !ref.current) return;

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
