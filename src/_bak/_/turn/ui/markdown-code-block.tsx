"use client";

import { Button } from "@briom/components/ui/button";
import { cn } from "@briom/libs/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import React, { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

function getCodeText(nodes: React.ReactNode): string {
	let text = "";

	React.Children.forEach(nodes, (child) => {
		if (typeof child === "string") {
			text += child;
			return;
		}

		if (typeof child === "number") {
			text += String(child);
			return;
		}

		if (!React.isValidElement(child)) return;

		// biome-ignore lint/suspicious/noExplicitAny: no types for this.
		if ((child.props as any)?.["data-no-copy"]) return;

		text += getCodeText((child.props as React.PropsWithChildren).children);
	});

	return text;
}

export function MarkdownCodeBlock({
	lang,
	children,
	isTerminal = false,
}: {
	lang: string;
	children: React.ReactNode;
	isTerminal?: boolean;
}) {
	const [_, copy] = useCopyToClipboard();
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = async () => {
		const success = await copy(getCodeText(children));
		if (success) {
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	return (
		<div
			className={cn(
				"max-w-full rounded-lg border border-border/50 my-3 flex flex-col",
				isTerminal ? "bg-background/80" : "bg-muted/40",
			)}
		>
			<div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30 bg-muted/60">
				<div className="flex items-center gap-1.5">
					<div
						className={cn(
							"size-2.5 rounded-full",
							isTerminal ? "bg-red-400/70" : "bg-terracotta/70",
						)}
					/>
					<div
						className={cn(
							"size-2.5 rounded-full",
							isTerminal ? "bg-yellow-400/70" : "bg-sage/70",
						)}
					/>
					<div
						className={cn(
							"size-2.5 rounded-full",
							isTerminal ? "bg-green-400/70" : "bg-dusty-blue/70",
						)}
					/>
				</div>

				<span className="ml-auto mr-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
					{lang}
				</span>

				<Button
					className="pointer-events-auto"
					data-no-copy
					onClick={handleCopy}
					size="icon-xs"
					variant="outline"
				>
					{isCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
				</Button>
			</div>
			<div className="w-full overflow-x-auto min-w-0 overscroll-behavior-y-none">
				<pre className="bg-transparent p-3 font-mono text-sm whitespace-pre block w-max min-w-full">
					{children}
				</pre>
			</div>
		</div>
	);
}
