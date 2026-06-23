import { Button } from "@briom/components/ui/button";
import { cn } from "@briom/libs/utils";

interface RoomScrollerProps {
	onClicked: () => void;
	show?: boolean;
}

export function RoomScroller({ onClicked, show }: RoomScrollerProps) {
	return (
		<div className="relative">
			<div
				className={cn(
					"absolute bottom-4 inset-x-0 max-w-3xl mx-auto px-4 md:px-8 z-10 flex justify-center transition-all duration-300 pointer-events-none",
					show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
				)}
			>
				<Button
					className="pointer-events-auto rounded-full backdrop-blur-xs"
					onClick={onClicked}
					size="xs"
					variant="outline"
				>
					Scroll to bottom
				</Button>
			</div>
		</div>
	);
}
