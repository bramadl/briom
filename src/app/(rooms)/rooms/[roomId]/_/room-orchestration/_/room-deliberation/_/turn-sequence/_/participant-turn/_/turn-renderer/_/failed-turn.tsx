"use client";

import { Button } from "@briom/components/ui/button";
import { Loader2Icon, RefreshCwIcon, XCircleIcon } from "lucide-react";

interface FailedTurnProps {
	error: string;
	isRetrying?: boolean;
	onRetried?: () => void;
	showAbort?: boolean;
	title: string;
}

export function FailedTurn({
	error,
	isRetrying = false,
	onRetried,
	title,
}: FailedTurnProps) {
	return (
		<div className="mt-3 flex flex-col gap-2">
			<div className="flex items-start gap-2 text-destructive/80">
				<XCircleIcon className="size-4 mt-0.5 shrink-0" />
				<div className="flex flex-col gap-0.5">
					<span className="text-xs font-medium">{title}</span>
					<span className="text-[11px] text-destructive/60 font-mono">
						{error}
					</span>
				</div>
			</div>
			{onRetried && (
				<Button
					className="self-start h-7 text-xs"
					disabled={isRetrying}
					onClick={onRetried}
					size="sm"
					variant="outline"
				>
					{isRetrying ? (
						<Loader2Icon className="animate-spin size-3" />
					) : (
						<RefreshCwIcon className="size-3" />
					)}
					{isRetrying ? "Retrying..." : "Retry"}
				</Button>
			)}
		</div>
	);
}
