"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@briom/components/ui/alert";
import { Button } from "@briom/components/ui/button";
import { AlertCircleIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useCallback, useTransition } from "react";

interface TurnFailedProps {
	/**
	 * @description
	 * Short label of the error.
	 */
	label: string;

	/**
	 * @description
	 * An optional retry handler which also
	 * determine wether the retry button
	 * should be rendered or not.
	 */
	onRetried?: () => void;

	/**
	 * @description
	 * What caused the error specifically.
	 */
	reason: string;
}

export function TurnFailed({ label, onRetried, reason }: TurnFailedProps) {
	const [pending, startTransition] = useTransition();

	const retry = useCallback(() => {
		if (!onRetried) return;
		startTransition(onRetried);
	}, [onRetried]);

	return (
		<Alert className="mt-3" variant="destructive">
			<AlertCircleIcon />
			<AlertTitle>{label}</AlertTitle>
			<AlertDescription>{reason}</AlertDescription>
			{onRetried && (
				<AlertAction>
					<Button
						className="self-start h-7 text-xs"
						disabled={pending}
						onClick={retry}
						size="sm"
						variant="outline"
					>
						{pending ? (
							<Loader2Icon className="animate-spin size-3" />
						) : (
							<RefreshCwIcon className="size-3" />
						)}
						{pending ? "Retrying..." : "Retry"}
					</Button>
				</AlertAction>
			)}
		</Alert>
	);
}
