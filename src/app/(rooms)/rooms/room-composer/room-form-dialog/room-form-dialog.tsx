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
import { roomQueries } from "@briom/rooms/api/queries/room.queries";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

import { RoomForm } from "./forms/room-form";
import { useRoomForm } from "./forms/use-room-form";
import { useRoomFormHandler } from "./forms/use-room-form-handler";
import { useRoomFormDialog } from "./use-room-form-dialog";

interface RoomFormProps {
	state: "opened" | "closed";
}

export function RoomFormDialog({ state }: RoomFormProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const { hideForm } = useRoomFormDialog();

	const { form, reset } = useRoomForm({ resetIf: state === "closed" });
	const { handleSubmit, isForming, isInviting } = useRoomFormHandler({
		onRoomFormed: hideForm,
	});

	const isSubmitting = isForming || isInviting;

	const { data: modelsData } = useQuery(roomQueries.getParticipantModels({}));
	const models = modelsData?.success ? modelsData.data.models : {};
	const useFreeModels = modelsData?.success
		? modelsData.data.useFreeModels
		: false;

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
				models={models}
				onSubmit={handleSubmit}
				useFreeModels={useFreeModels}
			/>
			<DialogFooter>
				<DialogClose asChild>
					<Button disabled={isSubmitting} onClick={reset} variant="outline">
						Discard
					</Button>
				</DialogClose>
				<Button disabled={isSubmitting} form="room-form" type="submit">
					{isForming
						? "Forming room..."
						: isInviting
							? "Inviting participants..."
							: "Form Room"}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
