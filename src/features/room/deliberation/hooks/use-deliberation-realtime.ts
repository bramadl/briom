import type { RoomTurnDTO } from "@briom/core/app";

import { useRoomSubscriber } from "./internal/use-room-subscriber";
import { useTurnSubscriber } from "./internal/use-turn-subscriber";

export function useDeliberationRealtime(params: {
	roomId: string;
	moderatorId: string;
	initialTurns: Pick<RoomTurnDTO, "id" | "status" | "content">[];
}) {
	const { roomId, moderatorId, initialTurns } = params;

	useRoomSubscriber({ roomId, moderatorId });
	useTurnSubscriber({ roomId, initialTurns });
}
