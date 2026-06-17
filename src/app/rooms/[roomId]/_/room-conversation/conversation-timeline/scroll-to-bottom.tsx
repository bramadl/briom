import { Button } from "@briom/components/ui/button";
import { cn } from "@briom/libs/utils";
import { ArrowDownIcon } from "lucide-react";

interface ScrollToBottomProps {
	onClicked: () => void;
	show?: boolean;
}

export function ScrollToBottom({ onClicked, show }: ScrollToBottomProps) {
	return (
		<div
			className={cn(
				"absolute bottom-4 inset-x-0 max-w-3xl mx-auto px-4 md:px-8 z-10 flex justify-end transition-all duration-300 pointer-events-none",
				show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
			)}
		>
			<Button
				className="pointer-events-auto h-9 w-9 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm"
				onClick={onClicked}
				size="icon"
				variant="default"
			>
				<ArrowDownIcon className="size-4" />
				<span className="sr-only">Scroll to bottom</span>
			</Button>
		</div>
	);
}
