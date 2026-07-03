"use client";

import { Button } from "@briom/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

interface RoomFormActionsProps {
	formId: string;
	isForming?: boolean;
	isInviting?: boolean;
	isSubmitting?: boolean;
	onCancel?: () => void;
}

export function RoomFormActions({
	formId,
	isForming,
	isInviting,
	isSubmitting,
	onCancel,
}: RoomFormActionsProps) {
	return (
		<div className="flex items-center justify-end gap-4 p-4">
			<Button
				disabled={isSubmitting}
				onClick={onCancel}
				type="button"
				variant="outline"
			>
				Cancel
			</Button>
			<Button disabled={isSubmitting} form={formId} type="submit">
				{isForming ? (
					<Fragment>
						<Loader2Icon className="animate-spin" />
						Forming room
					</Fragment>
				) : isInviting ? (
					<Fragment>
						<Loader2Icon className="animate-spin" />
						Inviting participants
					</Fragment>
				) : (
					<Fragment>Form Room</Fragment>
				)}
			</Button>
		</div>
	);
}
