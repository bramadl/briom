"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@briom/components/ui/alert";
import { Button } from "@briom/components/ui/button";
import { AlertCircleIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";

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
		<Alert className="mt-3" variant="destructive">
			<AlertCircleIcon />
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription>{error}</AlertDescription>
			{onRetried && (
				<AlertAction>
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
				</AlertAction>
			)}
		</Alert>
	);
}
