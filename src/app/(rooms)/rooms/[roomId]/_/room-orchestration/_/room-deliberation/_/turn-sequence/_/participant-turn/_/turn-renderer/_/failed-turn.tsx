import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@briom/components/ui/alert";
import { Button } from "@briom/components/ui/button";
import { AlertCircleIcon, LoaderCircleIcon, RotateCcwIcon } from "lucide-react";

interface FailedTurnProps {
	error: string;
	isRetrying?: boolean;
	onRetried?: () => void;
	title: string;
}

export function FailedTurn({
	error,
	isRetrying,
	onRetried,
	title,
}: FailedTurnProps) {
	return (
		<Alert className="max-w-none w-full mt-4" variant="destructive">
			<AlertCircleIcon />
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription>Cause: {error}</AlertDescription>
			<AlertAction>
				<Button
					disabled={isRetrying}
					onClick={onRetried}
					size="sm"
					variant="destructive"
				>
					{isRetrying ? (
						<LoaderCircleIcon className="animate-spin" />
					) : (
						<RotateCcwIcon />
					)}
					{isRetrying ? "Retrying" : "Retry"}
				</Button>
			</AlertAction>
		</Alert>
	);
}
