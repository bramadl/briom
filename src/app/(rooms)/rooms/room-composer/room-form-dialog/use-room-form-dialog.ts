"use client";

import { useContext } from "react";

import { RoomFormDialogContext } from "./room-form-dialog.context";

export const useRoomFormDialog = () => {
	const ctx = useContext(RoomFormDialogContext);
	if (!ctx) {
		throw new Error(
			"useRoomFormDialog must be used within RoomFormDialogProvider",
		);
	}
	return ctx;
};
