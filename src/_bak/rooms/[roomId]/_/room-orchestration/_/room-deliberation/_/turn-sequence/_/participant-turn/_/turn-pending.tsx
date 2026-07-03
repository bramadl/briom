import { Shimmer } from "@briom/animated/shimmer";
import { cn } from "@briom/libs/utils";
import { Fragment } from "react/jsx-runtime";

interface TurnPendingProps {
	className?: string;
	displayName: string;
	qualifiedModel: string;
}

export function TurnPending({
	className,
	displayName,
	qualifiedModel,
}: TurnPendingProps) {
	return (
		<Fragment>
			<div className="flex flex-col mb-3">
				<span className={cn("text-sm font-medium font-serif", className)}>
					{displayName}
				</span>
				<span className="text-xs text-muted-foreground">{qualifiedModel}</span>
			</div>
			<Shimmer />
		</Fragment>
	);
}
