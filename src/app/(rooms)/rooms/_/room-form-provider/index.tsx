"use client";

import { useRef } from "react";

import { RoomForm } from "./_/room-form";
import { RoomFormDialog } from "./_/room-form-dialog";

export function RoomFormProvider() {
	const dialogRef = useRef<HTMLDivElement>(null);
	return (
		<RoomFormDialog dialogRef={dialogRef}>
			<RoomForm className="my-4" dialogRef={dialogRef} />
		</RoomFormDialog>
	);
}
