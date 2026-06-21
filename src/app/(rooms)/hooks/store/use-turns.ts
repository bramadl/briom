import { isServerError } from "@briom/rooms/api/lib/server-action";
import { queryKeys } from "@briom/rooms/api/queries/keys";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useTurnsQuery } from "../queries/use-turns.query";

export function useTurns() {
	const { roomId } = useParams<{ roomId: string }>();
	if (!roomId) {
		throw new Error("useTurns must be used in `rooms/[roomId]` route!");
	}

	const { data: turnsData } = useTurnsQuery(roomId);
	if (isServerError(turnsData)) throw turnsData.error;

	const { turns } = turnsData.data;

	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.turns.list(roomId) });
	};

	return { invalidate, turns, roomId };
}
