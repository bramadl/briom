"use client";

import type { StreamEventError } from "@briom/api/contracts/types";
import { Button } from "@briom/components/ui/button";
import type { ParticipantDTO } from "@briom/core/application";
import { gsap, registerGsap } from "@briom/libs/gsap/register";
import { useGSAP } from "@gsap/react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface RetryStreamBannerProps {
	message?: string;
	onDismiss: () => void;
	onRetry: () => void;
	participantId?: string | null;
	participants: ParticipantDTO[];
	retryAfter?: number;
	streamError?: StreamEventError | null;
}

export function RetryStreamBanner({
	message,
	onDismiss,
	onRetry,
	participantId,
	participants,
	retryAfter,
	streamError,
}: RetryStreamBannerProps) {
	const [countdown, setCountdown] = useState(retryAfter || 0);

	const disabled = countdown > 0;
	const displayName = useMemo(() => {
		if (!participantId) return "AI";
		const model = participants.find((p) => p.id === participantId)?.displayName;
		return model ?? "AI";
	}, [participantId, participants]);

	const bannerMessage = useMemo(() => {
		if (message) return message;
		if (streamError?.kind === "RATE_LIMITED") {
			return `${displayName} is currently busy. Retry in a moment.`;
		}
		return `${displayName}'s last response was interrupted. Click retry to continue.`;
	}, [message, displayName, streamError]);

	useEffect(() => {
		if (!retryAfter || countdown <= 0) return;
		const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
		return () => clearInterval(timer);
	}, [retryAfter, countdown]);

	const containerRef = useRef<HTMLDivElement>(null);
	useGSAP(
		() => {
			if (!containerRef.current) return;
			registerGsap();
			gsap.to(containerRef.current, {
				autoAlpha: 1,
				y: 0,
				duration: 0.4,
				ease: "power2.out",
			});
		},
		{ scope: containerRef, dependencies: [] },
	);

	return (
		<div className="px-4 md:px-8 translate-y-8 opacity-0" ref={containerRef}>
			<div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm">
				<AlertCircle className="size-4 shrink-0 text-destructive" />
				<p className="flex-1 text-muted-foreground">{bannerMessage}</p>
				<div className="flex items-center gap-2 shrink-0">
					{retryAfter !== undefined && disabled && (
						<span className="text-xs text-muted-foreground font-mono">
							{countdown}s
						</span>
					)}
					<Button
						className="h-7 gap-1.5 text-xs"
						disabled={disabled}
						onClick={onRetry}
						size="sm"
						variant="outline"
					>
						<RotateCcw className="size-3" />
						{disabled ? `Retry in ${countdown}s` : "Retry"}
					</Button>
					<Button
						className="h-7 text-xs"
						onClick={onDismiss}
						size="sm"
						variant="ghost"
					>
						Dismiss
					</Button>
				</div>
			</div>
		</div>
	);
}
