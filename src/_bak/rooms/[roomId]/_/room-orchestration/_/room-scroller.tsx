"use client";

import { Button } from "@briom/components/ui/button";
import { cn } from "@briom/libs/utils";

interface RoomScrollerProps {
	onScrollToBottom: () => void;
	show?: boolean;
}

export function RoomScroller({ onScrollToBottom, show }: RoomScrollerProps) {
	return (
		<div className="relative">
			<div
				className={cn(
					"absolute bottom-4 inset-x-0 max-w-3xl mx-auto px-4 md:px-8 z-10 flex justify-center transition-all duration-300",
					show
						? "translate-y-0 opacity-100 pointer-events-auto"
						: "translate-y-4 opacity-0 pointer-events-none",
				)}
			>
				<Button
					className="rounded-full backdrop-blur-xs"
					onClick={onScrollToBottom}
					size="xs"
					tabIndex={show ? 1 : -1}
					variant="outline"
				>
					Scroll to bottom
				</Button>
			</div>
		</div>
	);
}
