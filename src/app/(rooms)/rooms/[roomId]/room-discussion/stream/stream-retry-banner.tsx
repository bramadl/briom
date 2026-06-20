import { Button } from "@briom/components/ui/button";
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";

export function StreamRetryBanner() {
	return (
		<div className="px-4 md:px-8 translate-y-8 opacity-0">
			<div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm">
				<AlertCircleIcon className="size-4 shrink-0 text-destructive" />
				<p className="flex-1 text-muted-foreground">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed, culpa.
				</p>
				<div className="flex items-center gap-2 shrink-0">
					<span className="text-xs text-muted-foreground font-mono">10s</span>
					<Button className="h-7 gap-1.5 text-xs" size="sm" variant="outline">
						<RotateCcwIcon className="size-3" />
						Retry in 10s
					</Button>
					<Button className="h-7 text-xs" size="sm" variant="ghost">
						Dismiss
					</Button>
				</div>
			</div>
		</div>
	);
}
