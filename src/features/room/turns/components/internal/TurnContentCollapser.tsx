"use client";

import { cn } from "@briom/libs/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COLLAPSED_HEIGHT = 64;

interface TurnContentCollapserProps {
	/**
	 * @description
	 * Node content of this turn.
	 * Usually paired with `TurnContent`.
	 *
	 * @see TurnContent
	 */
	children: React.ReactNode;

	/**
	 * @description
	 * Additional className to be merged
	 * with the internal className set.
	 */
	className?: string;

	/**
	 * @description
	 * A number indicating "how much until the
	 * turn should be collapsed".
	 *
	 * @default 64
	 */
	collapsedHeight?: number;

	/**
	 * @description
	 * A controlled state from parent.
	 *
	 * I don't know why we need the parent to
	 * control this damn component.
	 *
	 * Something related to performance-bottleneck
	 * caused me having to re-designed the component.
	 */
	isCollapsed?: boolean;

	/**
	 * @description
	 * Requires by the internal class to remove
	 * transition style.
	 */
	isStreaming?: boolean;

	/**
	 * @description
	 * Triggered when the internal "Show more" button
	 * is clicked.
	 *
	 * Paired with `isCollapsed` props. Full control
	 * by the parent. So Parent has to re-define the
	 * state again (derived from the previous value).
	 */
	onToggled?: () => void;
}

export function TurnContentCollapser({
	children,
	collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
	className,
	isCollapsed = false,
	isStreaming = false,
	onToggled,
}: TurnContentCollapserProps) {
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

	const showFade = isOverflowing && isCollapsed && !isStreaming;
	const showToggle = isOverflowing && !isStreaming;

	const maxHeight = isStreaming
		? undefined
		: !isCollapsed
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
					onClick={onToggled}
					type="button"
				>
					{!isCollapsed ? "Show less" : "Show more"}
					{!isCollapsed ? (
						<ChevronUp className="size-3" />
					) : (
						<ChevronDown className="size-3" />
					)}
				</button>
			)}
		</div>
	);
}
