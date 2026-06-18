import { createContext } from "react";

interface RoomContextValue {
	openRoomFormDialog: () => void;
}

export const RoomContext = createContext<RoomContextValue | null>(null);
