"use client";

import { cn } from "@briom/libs/utils";
import { useEffect, useState } from "react";
import {
	CONNECTING_MESSAGES,
	getMessage,
	STREAMING_MESSAGES,
	THINKING_MESSAGES,
} from "./thinking-messages";

interface ThinkingIndicatorProps {
	name: string;
	phase?: "idle" | "connecting" | "thinking" | "streaming";
}

export function ThinkingIndicator({
	name,
	phase = "connecting",
}: ThinkingIndicatorProps) {
	const [elapsed, setElapsed] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Watches props
	useEffect(() => {
		const start = Date.now();
		const interval = setInterval(() => {
			setElapsed(Date.now() - start);
		}, 1000);
		return () => clearInterval(interval);
	}, [name, phase]);

	if (phase === "idle") return null;

	const messages =
		phase === "connecting"
			? CONNECTING_MESSAGES
			: phase === "thinking"
				? THINKING_MESSAGES
				: STREAMING_MESSAGES;

	const label = getMessage(name, messages, elapsed);

	const phaseConfig = {
		connecting: {
			dotsClass: "bg-muted-foreground/30",
			textClass: "text-muted-foreground/40",
			animation: "animate-pulse",
		},
		thinking: {
			dotsClass:
				elapsed > 120000
					? "bg-terracotta/40"
					: elapsed > 60000
						? "bg-dusty-blue/40"
						: "bg-muted-foreground/50",
			textClass:
				elapsed > 120000
					? "text-terracotta/60"
					: elapsed > 60000
						? "text-dusty-blue/60"
						: "text-muted-foreground/60",
			animation: "animate-bounce",
		},
		streaming: {
			dotsClass: "bg-primary/60",
			textClass: "text-primary/80",
			animation: "animate-pulse",
		},
	};

	const config = phaseConfig[phase];

	return (
		<div className="pl-4 border-l-2 py-1">
			<div className="flex items-center gap-2">
				<span
					className={cn(
						"text-xs font-mono transition-colors duration-700",
						config.textClass,
					)}
				>
					{label}
				</span>
				<div className="flex gap-0.5 items-end h-3">
					{[0, 1, 2].map((i) => (
						<span
							className={cn(
								"size-1 rounded-full transition-colors duration-700",
								config.dotsClass,
								config.animation,
							)}
							key={i.toString()}
							style={{ animationDelay: `${i * 150}ms` }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
