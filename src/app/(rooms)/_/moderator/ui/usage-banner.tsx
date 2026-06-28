"use client";

import { cn } from "@briom/libs/utils";
import { AlertTriangleIcon, BanIcon } from "lucide-react";

import { useModeratorUsage } from "../hooks/use-moderator-usage";

export function ModeratorUsageBanner() {
	const { exceeded, limit, nearLimit, resetsAt, used } = useModeratorUsage();
	if (!exceeded && !nearLimit) return null;

	return (
		<div
			className={cn(
				"sticky top-0 inset-x-0 px-4 py-2 text-sm flex items-center gap-2 animate-in slide-in-from-bottom fade-in-0",
				exceeded
					? "bg-destructive/10 text-destructive border-b border-destructive/20"
					: "bg-amber-500/10 text-amber-600 border-b border-amber-500/20",
			)}
		>
			{exceeded ? (
				<>
					<BanIcon className="size-3.5 shrink-0" />
					Monthly limit reached ({used}/{limit} turns). Resets{" "}
					{new Date(resetsAt).toLocaleDateString()}.
				</>
			) : (
				<>
					<AlertTriangleIcon className="size-3.5 shrink-0" />
					{limit - used} participant turns remaining this month.
				</>
			)}
		</div>
	);
}
