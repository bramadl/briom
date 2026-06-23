import type { RoomDTO, TurnDTO } from "@briom/app";
import { turnQueries } from "@briom/rooms/_/turn/queries/registry";
import type { QueryClient } from "@tanstack/react-query";

import { roomQueries } from "../../queries/registry";

export function patchRoom(
	queryClient: QueryClient,
	roomId: string,
	patcher: (room: RoomDTO) => RoomDTO,
): void {
	queryClient.setQueryData(roomQueries.getRoom({ roomId }).queryKey, (old) => {
		if (!old?.room) return old;
		return { ...old.room, room: patcher(old.room) };
	});
}

export function patchTurns(
	queryClient: QueryClient,
	roomId: string,
	patcher: (turns: TurnDTO[]) => TurnDTO[],
): void {
	queryClient.setQueryData(turnQueries.getTurns({ roomId }).queryKey, (old) => {
		if (!old) return old;
		return { ...old.turns, turns: patcher(old.turns) };
	});
}
