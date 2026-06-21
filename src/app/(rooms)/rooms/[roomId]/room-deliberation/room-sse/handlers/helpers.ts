import type { GetRoomOutput, GetTurnsOutput } from "@briom/app";
import {
	isServerError,
	type ServerActionResult,
} from "@briom/rooms/api/lib/server-action";
import { queryKeys } from "@briom/rooms/api/queries/keys";
import type { QueryClient } from "@tanstack/react-query";

export function patchRoom(
	queryClient: QueryClient,
	roomId: string,
	patcher: (room: NonNullable<GetRoomOutput["room"]>) => GetRoomOutput["room"],
): void {
	queryClient.setQueryData(
		queryKeys.rooms.get(roomId),
		(old: ServerActionResult<GetRoomOutput> | undefined) => {
			if (!old || isServerError(old) || !old.data.room) return old;
			return {
				success: true,
				data: { room: patcher(old.data.room) },
			};
		},
	);
}

export function patchTurns(
	queryClient: QueryClient,
	roomId: string,
	patcher: (turns: GetTurnsOutput["turns"]) => GetTurnsOutput["turns"],
): void {
	queryClient.setQueryData(
		queryKeys.turns.list(roomId),
		(old: ServerActionResult<GetTurnsOutput> | undefined) => {
			if (!old || isServerError(old)) return old;

			return {
				success: true,
				data: { turns: patcher(old.data.turns) },
			};
		},
	);
}
