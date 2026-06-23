"use client";

import { Button } from "@briom/components/ui/button";
import { ArrowUpIcon, LoaderCircleIcon, SquareIcon } from "lucide-react";

interface EditorSendButtonProps {
	isDisabled?: boolean;
	isSending?: boolean;
	isStreaming?: boolean;
	onAbort?: () => void;
	onSend?: () => void | Promise<void>;
}

export function EditorSendButton({
	isDisabled = false,
	isSending = false,
	isStreaming = false,
	onAbort,
	onSend,
}: EditorSendButtonProps) {
	const handleClick = () => {
		if (isStreaming) {
			onAbort?.();
		} else {
			onSend?.();
		}
	};

	return (
		<Button
			className="group/button h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={isDisabled && !isStreaming}
			onClick={handleClick}
			size="icon"
			type="button"
		>
			{isStreaming ? (
				<SquareIcon className="fill-current size-4" />
			) : isSending ? (
				<LoaderCircleIcon className="animate-spin size-4" />
			) : (
				<ArrowUpIcon className="size-4" />
			)}
		</Button>
	);
}
