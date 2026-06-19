"use client";

import { Dialog } from "@briom/components/ui/dialog";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useState } from "react";

import { RoomFormDialog } from "./room-form-dialog";
import { RoomFormDialogContext } from "./room-form-dialog.context";

export function RoomFormDialogProvider({ children }: React.PropsWithChildren) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const hideForm = () => void setIsDialogOpen(false);
	const showForm = () => void setIsDialogOpen(true);

	useHotkey("Mod+.", isDialogOpen ? hideForm : showForm);

	return (
		<RoomFormDialogContext.Provider value={{ hideForm, showForm }}>
			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				{children}
				<RoomFormDialog state={isDialogOpen ? "opened" : "closed"} />
			</Dialog>
		</RoomFormDialogContext.Provider>
	);
}
