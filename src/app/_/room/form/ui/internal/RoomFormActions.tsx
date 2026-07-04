"use client";

import { Button } from "@briom/components/ui/button";
import { DialogFooter } from "@briom/components/ui/dialog";
import { cn } from "@briom/libs/utils";
import { Loader2Icon } from "lucide-react";

interface RoomFormActionsProps {
	/**
	 * @description
	 * Extra classname to combine with.
	 *
	 * Useful to control the sizing of paddings if needed.
	 */
	className?: string;

	/**
	 * @description
	 * The form id in which the submit button will attach into.
	 */
	id: string;

	/**
	 * @description
	 * If true, the buttons will be disabled, then the submit
	 * button will show loading state.
	 */
	isSubmitting: boolean;

	/**
	 * @description
	 * Runs when the cancel button is clicked.
	 */
	onCanceled: () => void;
}

export function RoomFormActions({
	className,
	id,
	isSubmitting,
	onCanceled,
}: RoomFormActionsProps) {
	return (
		<DialogFooter
			className={cn("flex items-center justify-end gap-4 p-4", className)}
		>
			<Button
				disabled={isSubmitting}
				onClick={onCanceled}
				type="button"
				variant="outline"
			>
				Cancel
			</Button>
			<Button disabled={isSubmitting} form={id} type="submit">
				{isSubmitting && <Loader2Icon className="animate-spin" />}
				{isSubmitting ? "Forming..." : "Form Room"}
			</Button>
		</DialogFooter>
	);
}
