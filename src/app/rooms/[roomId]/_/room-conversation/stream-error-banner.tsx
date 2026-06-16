import { Button } from "@briom/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

interface StreamErrorBannerProps {
	message?: string;
	onDismiss: () => void;
	onRetry: () => void;
}

export function StreamErrorBanner({
	message = "Something went wrong generating the response.",
	onDismiss,
	onRetry,
}: StreamErrorBannerProps) {
	return (
		<div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm mx-4 md:mx-8 mb-2">
			<AlertCircle className="size-4 shrink-0 text-destructive" />
			<p className="flex-1 text-muted-foreground">{message}</p>
			<div className="flex items-center gap-2 shrink-0">
				<Button
					className="h-7 gap-1.5 text-xs"
					onClick={onRetry}
					size="sm"
					variant="outline"
				>
					<RotateCcw className="size-3" />
					Retry
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
	);
}
