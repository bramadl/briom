import { Button } from "@briom/components/ui/button";
import { ArrowUpIcon } from "lucide-react";

export function EditorSendButton() {
	return (
		<Button
			className="group/button h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
			// disabled={isStreaming ? false : isEmpty || isDisabled}
			// onClick={isStreaming ? onAbort : handleSend}
			size="icon"
		>
			<ArrowUpIcon />
			{/* {isStreaming ? (
				<SquareIcon className="fill-current" />
			) : sending ? (
				<LoaderCircleIcon className="animate-spin" />
			) : (
				<ArrowUpIcon />
			)} */}
		</Button>
	);
}
