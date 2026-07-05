"use client";

import { Badge } from "@briom/components/ui/badge";
import { cn } from "@briom/libs/utils";
import type { ParticipantModel } from "@briom/room/participant/adapters/participant-model.adapter";
import { SparkleIcon } from "lucide-react";

interface RoomParticipantSelectionItemProps {
	/**
	 * @description
	 * If true, selection item can not be clicked.
	 */
	disabled: boolean;

	/**
	 * @description
	 * Put the model on all the way on top.
	 * Also rendering Featured Badge on it.
	 */
	isFeatured: boolean;

	/**
	 * @description
	 * Used to append `animate-pulse` class.
	 *
	 * Useful if the parent uses transition or
	 * deferred value sort of mechanism.
	 */
	isPending: boolean;

	/**
	 * @description
	 * Wether this participant was selected.
	 */
	isSelected: boolean;

	/**
	 * @description
	 * Fully qualified model in standard format.
	 *
	 * @example anthropic/claude-sonnet-5.0
	 */
	model: ParticipantModel;

	/**
	 * @description
	 * Fires when the model is selected.
	 */
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
