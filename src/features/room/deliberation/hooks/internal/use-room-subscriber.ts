import {
	DeliberationConcluded,
	DeliberationStarted,
	TurnSlotClaimed,
	TurnSlotReleased,
} from "@briom/core/domain";
import { useRoomStore } from "@briom/room/hooks/use-room-store";
import { roomQueryOptions } from "@briom/room/queries/query.options";
import { createAuthClient } from "@briom/supabase/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

const supabaseClient = createAuthClient();

/**
 * @description
 * Rebuilds the Supabase channel name from a Room domain event's
 * `.type` (shaped `"scope:entity"`), mirroring `RoomsEventSubscriber
 * .forward()` on the BE exactly: `${scope}:${moderatorId}:${entity}`.
 * Room events stay on Supabase Realtime — low frequency, no reason to
 * move them.
 */
function roomChannelFor(eventType: string, moderatorId: string): string {
	const [scope, entity] = eventType.split(":");
	return `${scope}:${moderatorId}:${entity}`;
}

interface RoomScopedPayload {
	roomId: string;
}

/**
 * @description
 * Subscribes to Room-level events over Supabase Realtime. Everything
 * this touches is either a query invalidation or `useRoomStore`'s one
 * remaining transient field (`isTurnSlotClaimed`) — `RoomFrozen`/
 * `RoomUnfrozen`/`RoomLocked`/`RoomUnlocked` do NOT set store state
 * anymore, since `RoomDTO.state` is now the durable source of truth
 * for that; these events just trigger a refetch, same treatment as
 * `DeliberationStarted`/`Concluded` already had.
 */
export function useRoomSubscriber(params: {
	roomId: string;
	moderatorId: string;
}) {
	const { roomId, moderatorId } = params;
	const queryClient = useQueryClient();
	const queryKey = roomQueryOptions.getRoom(roomId).queryKey;

	const reset = useRoomStore((s) => s.reset);
	const setTurnSlotClaimed = useRoomStore((s) => s.setTurnSlotClaimed);

	// biome-ignore lint/correctness/useExhaustiveDependencies: store setters are stable zustand references.
	const invalidateRoom = useCallback(() => {
		queryClient.invalidateQueries({ queryKey, exact: true });
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: store setters are stable zustand references.
	useEffect(() => {
		const belongsToRoom = (payload: RoomScopedPayload) =>
			payload.roomId === roomId;

		const roomChannel = supabaseClient.channel(
			roomChannelFor(DeliberationStarted.type, moderatorId),
		);

		roomChannel
			.on(
				"broadcast",
				{ event: DeliberationStarted.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					invalidateRoom();
				},
			)
			.on(
				"broadcast",
				{ event: DeliberationConcluded.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					invalidateRoom();
				},
			)
			// `RoomFrozen`/`RoomUnfrozen`/`RoomLocked`/`RoomUnlocked` all
			// collapse to the same handler now — `room.state` (populated
			// from a fresh fetch) is what FE reads, this just triggers
			// that fetch. The event's own payload (`reason`, `kind`) is
			// intentionally unused; the refetched DTO carries the
			// authoritative version of both.
			.on(
				"broadcast",
				{ event: "room:frozen" },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					invalidateRoom();
				},
			)
			.on(
				"broadcast",
				{ event: "room:unfrozen" },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					invalidateRoom();
				},
			)
			.on(
				"broadcast",
				{ event: "room:locked" },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					invalidateRoom();
				},
			)
			.on(
				"broadcast",
				{ event: "room:unlocked" },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					invalidateRoom();
				},
			)
			.on(
				"broadcast",
				{ event: TurnSlotClaimed.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					setTurnSlotClaimed(true);
				},
			)
			.on(
				"broadcast",
				{ event: TurnSlotReleased.type },
				({ payload }: { payload: RoomScopedPayload }) => {
					if (!belongsToRoom(payload)) return;
					setTurnSlotClaimed(false);
				},
			)
			.subscribe();

		return () => {
			supabaseClient.removeChannel(roomChannel);
			reset();
		};
	}, [roomId, moderatorId]);
}
