"use client";

import { Button } from "@briom/components/ui/button";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@briom/components/ui/dialog";
import { Loader2Icon } from "lucide-react";
import { Fragment, useRef } from "react";

import { RoomForm } from "./forms/room-form";
import { useRoomForm } from "./forms/use-room-form";
import { useRoomFormSubmission } from "./forms/use-room-form-submission";
import { useRoomFormDialog } from "./use-room-form-dialog";

interface RoomFormProps {
	state: "opened" | "closed";
}

export function RoomFormDialog({ state }: RoomFormProps) {
	const dialogRef = useRef<HTMLDivElement>(null);

	const { id, form, reset } = useRoomForm({ resetIf: state === "closed" });
	const { hideForm } = useRoomFormDialog();
	const { handleSubmit, isForming, isInviting, isSubmitting } =
		useRoomFormSubmission({ onRoomFormed: hideForm });

	return (
		<DialogContent
			className="gap-0 lg:max-w-xl"
			ref={dialogRef}
			showCloseButton={false}
		>
			<DialogHeader>
				<DialogTitle>Form a Room</DialogTitle>
				<DialogDescription>
					Create a dedicated space for collaborative thinking. Invite
					perspectives, then guide the deliberation.
				</DialogDescription>
			</DialogHeader>
			<RoomForm
				dialogRef={dialogRef}
				disabled={isSubmitting}
				form={form}
				id={id}
				onSubmit={handleSubmit}
			/>
			<DialogFooter>
				<DialogClose asChild>
					<Button disabled={isSubmitting} onClick={reset} variant="outline">
						Discard
					</Button>
				</DialogClose>
				<Button disabled={isSubmitting} form={id} type="submit">
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
			</DialogFooter>
		</DialogContent>
	);
}
