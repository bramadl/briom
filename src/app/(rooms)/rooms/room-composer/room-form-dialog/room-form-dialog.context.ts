import { createContext } from "react";

interface RoomFormDialogContextValue {
	hideForm: () => void;
	showForm: () => void;
}

export const RoomFormDialogContext =
	createContext<RoomFormDialogContextValue | null>(null);
