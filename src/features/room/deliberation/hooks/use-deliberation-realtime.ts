import { useRoomSubscriber } from "./internal/use-room-subscriber";
import { useTurnSubscriber } from "./internal/use-turn-subscriber";

/**
 * @description
 * Mount exactly once per room view, in `RoomDeliberation`. Composes
 * the two independent subscriptions this room needs — Room events over
 * Supabase (`useRoomSubscriber`) and Turn events over Inngest Realtime
 * (`useTurnSubscriber`) — each writing to its own store, with its own
 * cleanup/reset lifecycle. No component below this should ever open
 * its own channel or subscription; everyone reads derived state via
 * the stores' selector hooks (or `useRoom`, for anything that's
 * already a DTO field).
 */
export function useDeliberationRealtime(params: {
	roomId: string;
	moderatorId: string;
}) {
	const { roomId, moderatorId } = params;

	useRoomSubscriber({ roomId, moderatorId });
	useTurnSubscriber({ roomId });
}
