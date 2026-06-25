"use client";

import { cn } from "@briom/libs/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COLLAPSED_HEIGHT = 64;

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
	const [expanded, setExpanded] = useState(!defaultCollapsed);
	const contentRef = useRef<HTMLDivElement>(null);
	const [isOverflowing, setIsOverflowing] = useState(false);

	const checkOverflow = useCallback(() => {
		const el = contentRef.current;
		if (!el || isStreaming) {
			setIsOverflowing(false);
			return;
		}
		setIsOverflowing(el.scrollHeight > collapsedHeight + 1);
	}, [collapsedHeight, isStreaming]);

	useEffect(() => {
		checkOverflow();
	}, [checkOverflow]);

	useEffect(() => {
		setExpanded(!defaultCollapsed);
	}, [defaultCollapsed]);

	const showFade = isOverflowing && !expanded && !isStreaming;
	const showToggle = isOverflowing && !isStreaming;

	const maxHeight = isStreaming
		? undefined
		: expanded
			? undefined
			: isOverflowing
				? collapsedHeight
				: undefined;

	const maskImage = showFade
		? `linear-gradient(to bottom, black 60%, transparent 100%)`
		: undefined;

	return (
		<div className="relative">
			<div
				className={cn(
					"overflow-clip transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none",
					isStreaming && "transition-none",
					className,
				)}
				ref={contentRef}
				style={{ maxHeight, maskImage, WebkitMaskImage: maskImage }}
			>
				{children}
			</div>
			{showToggle && (
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
