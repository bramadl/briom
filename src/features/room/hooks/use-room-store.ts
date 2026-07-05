import { create } from "zustand";

/**
 * @description
 * Room-level transient state, driven exclusively by `RoomsEventSubscriber`
 * events over Supabase Realtime (see `useRoomSubscriber`).
 *
 * This is NOT a cache of `RoomDTO` — anything that has a DTO field
 * (like `room.state` for frozen/locked, or `room.info.metadata.status`
 * for concluded) belongs to `useRoom`, not here. `useRoom` reads
 * server-persisted state; this store holds signals that don't (yet)
 * have a durable representation on the server — currently just
 * `isTurnSlotClaimed`, an instantaneous claim/release toggle with no
 * corresponding DTO field. If that ever changes (e.g. a hard refresh
 * needs to recover "is a turn currently claimed" without waiting for a
 * realtime event), it likely becomes a DTO field too — see how
 * `RoomDTO.state` absorbed `isFrozen`/`isLocked` for the same reason.
 *
 * `RoomFrozen`/`RoomUnfrozen`/`RoomLocked`/`RoomUnlocked` do NOT set
 * anything here — they invalidate `useRoom`'s query instead, since
 * `room.state` is now the DTO's source of truth for that.
 */
interface RoomState {
	isTurnSlotClaimed: boolean;
	reset: () => void;
	setTurnSlotClaimed: (claimed: boolean) => void;
}

const initialState = {
	isTurnSlotClaimed: false,
};

export const useRoomStore = create<RoomState>((set) => ({
	...initialState,
	setTurnSlotClaimed: (claimed) => set({ isTurnSlotClaimed: claimed }),
	reset: () => set({ ...initialState }),
}));

/**
 * @description
 * Consumed by `TurnProposals`/retry buttons/`DeliberationEditor`.
 * Room-conclusion is NOT checked here — callers combine this with
 * `!isConcluded` from `useRoom`, the same way this used to combine
 * with the store's own (now-removed) `isFrozen`/`isLocked` fields —
 * those live on `useRoom`'s `room.state` now.
 */
export function useIsTurnSlotClaimed() {
	return useRoomStore((s) => s.isTurnSlotClaimed);
}
