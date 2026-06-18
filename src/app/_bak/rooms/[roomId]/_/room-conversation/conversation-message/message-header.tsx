import { Badge } from "@briom/components/ui/badge";
import { cn } from "@briom/libs/utils";

interface MessageHeaderProps {
	displayName: string;
	intent: string | null;
	isUser?: boolean;
	model: string;
	textColor: string;
}

export function MessageHeader({
	displayName,
	intent,
	isUser,
	model,
	textColor,
}: MessageHeaderProps) {
	return (
		<div className="flex flex-col mb-2">
			<div className="flex items-center gap-2">
				<span className={cn("text-sm font-medium font-serif", textColor)}>
					{displayName}
				</span>
				{intent && (
					<Badge
						className="text-[10px] uppercase tracking-widest px-2 py-0 h-4 border-border/50 text-muted-foreground font-mono"
						variant="outline"
					>
						{intent}
					</Badge>
				)}
			</div>
			{!isUser && (
				<span className="text-xs text-muted-foreground">{model}</span>
			)}
		</div>
	);
}
