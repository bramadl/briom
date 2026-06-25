import type { RoomDeliberationDTO } from "@briom/app";
import type { QueryClient } from "@tanstack/react-query";

import { roomQueries } from "../../queries/registry";

export function patchDeliberation(
	queryClient: QueryClient,
	roomId: string,
	patcher: (room: RoomDeliberationDTO) => RoomDeliberationDTO,
): void {
	queryClient.setQueryData(
		roomQueries.getRoomDeliberation({ roomId }).queryKey,
		(old) => {
			if (!old?.room) return old;
			return { room: patcher(old.room) };
		},
	);
}
