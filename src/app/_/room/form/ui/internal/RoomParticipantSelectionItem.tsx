"use client";

import { Badge } from "@briom/components/ui/badge";
import { cn } from "@briom/libs/utils";
import { SparkleIcon } from "lucide-react";

import type { ParticipantModel } from "../../../participant/adapters/participant-model.adapter";

interface RoomParticipantSelectionItemProps {
	disabled: boolean;
	isFeatured: boolean;
	isPending: boolean;
	isSelected: boolean;
	model: ParticipantModel;
	onSelect: () => void;
}

export function RoomParticipantSelectionItem({
	disabled,
	isFeatured,
	isPending,
	isSelected,
	model,
	onSelect,
}: RoomParticipantSelectionItemProps) {
	return (
		<button
			className={cn(
				"relative inline-flex flex-col gap-0 border rounded-lg p-4 transition-all text-left",
				"disabled:opacity-50 disabled:pointer-events-none",
				isPending && "animate-pulse",
				isSelected
					? "border-primary bg-primary/10 hover:bg-primary/20"
					: "hover:border-primary/50 hover:bg-primary/5",
			)}
			disabled={disabled}
			onClick={onSelect}
			type="button"
		>
			{isFeatured && (
				<span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-primary">
					<SparkleIcon className="size-3" />
					Featured
				</span>
			)}
			<Badge className="mb-2" variant="secondary">
				{model.isFree ? "Free" : "Paid"}
			</Badge>
			<span className="text-sm font-medium pr-16 line-clamp-1">
				{model.name}
			</span>
			<span className="text-xs text-muted-foreground">{model.id}</span>
		</button>
	);
}
