"use client";

import { cn } from "@briom/libs/utils";
import { Button } from "@briom/ui/button";
import { ArrowUp } from "lucide-react";
import { useState } from "react";

interface ConversationInputProps {
	disabled?: boolean;
	onSend: (content: string) => Promise<void>;
	placeholder?: string;
}

export function ConversationInput({
	onSend,
	disabled,
	placeholder = "Bring something into the discussion... (use @ to mention a participant)",
}: ConversationInputProps) {
	const [value, setValue] = useState("");
	const [sending, setSending] = useState(false);

	async function handleSend() {
		if (!value.trim() || sending) return;
		setSending(true);
		try {
			await onSend(value.trim());
			setValue("");
		} finally {
			setSending(false);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	return (
		<div
			className={cn(
				"relative max-w-4xl mx-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-colors",
				"focus-within:border-border",
			)}
		>
			<textarea
				className={cn(
					"w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-foreground",
					"placeholder:text-muted-foreground/40",
					"focus:outline-none disabled:opacity-50",
					"font-sans leading-relaxed",
				)}
				disabled={disabled || sending}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				rows={2}
				value={value}
			/>
			<div className="flex items-center justify-between px-3 pb-2.5">
				<span className="text-[10px] text-muted-foreground/30 font-mono">
					↵ send · shift+↵ newline · @ mention
				</span>
				<Button
					className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
					disabled={!value.trim() || disabled || sending}
					onClick={handleSend}
					size="icon"
				>
					<ArrowUp className="h-3.5 w-3.5" />
				</Button>
			</div>
		</div>
	);
}
