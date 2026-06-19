"use client";

import { Button } from "@briom/components/ui/button";
import { PlusIcon } from "lucide-react";

import { useRoomFormDialog } from "./use-room-form-dialog";

export function RoomFormDialogTrigger() {
	const { showForm } = useRoomFormDialog();

	return (
		<Button onClick={showForm}>
			<PlusIcon />
			New room
		</Button>
	);
}
