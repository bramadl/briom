import { useContext } from "react";
import { RoomScrollerContext } from "./room-scroller.context";

export function useRoomScroller() {
	const ctx = useContext(RoomScrollerContext);
	if (!ctx) throw new Error("useRoomScroller must be used within RoomPanel");
	return ctx;
}
