import type { ParticipantModelDTO } from "@briom/app/bak";
import { Badge } from "@briom/components/ui/badge";
import { cn } from "@briom/libs/utils";
import { useCallback, useMemo, useState } from "react";

interface ParticipantSelectorProps {
	disabled?: boolean;
	lockFreeModel?: boolean;
	model: ParticipantModelDTO;
	onModelSelected: (isSelected: boolean) => void;
}

export function ParticipantSelector({
	disabled,
	lockFreeModel,
	model,
	onModelSelected,
}: ParticipantSelectorProps) {
	const [isSelected, setIsSelected] = useState(false);

	const shouldDisabled = useMemo(() => {
		if (isSelected) return false;
		return disabled || (lockFreeModel && !model.isFree);
	}, [disabled, isSelected, lockFreeModel, model.isFree]);

	const clickHandler = useCallback(() => {
		const nextSelectedState = !isSelected;
		setIsSelected(nextSelectedState);
		onModelSelected(nextSelectedState);
	}, [isSelected, onModelSelected]);

	return (
		<button
			className={cn(
				"inline-flex flex-col gap-0 border rounded-lg p-4 transition-all text-left",
				"disabled:opacity-50 disabled:pointer-events-none",
				isSelected
					? "border-primary bg-primary/10 hover:bg-primary/20"
					: "hover:border-primary/50 hover:bg-primary/5",
			)}
			disabled={shouldDisabled}
			onClick={clickHandler}
			type="button"
		>
			<Badge className="mb-2" variant="secondary">
				{!model.isFree ? "Paid" : "Free"}
			</Badge>
			<span className="text-sm font-medium">{model.name}</span>
			<span className="text-xs text-muted-foreground">
				{model.qualifiedModel}
			</span>
		</button>
	);
}
