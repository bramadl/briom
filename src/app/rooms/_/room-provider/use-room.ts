import { useContext } from "react";

import { RoomContext } from "./context";

export const useRoom = () => {
	const ctx = useContext(RoomContext);
	if (!ctx) throw new Error("useRoom must be used within RoomProvider");
	return ctx;
};
