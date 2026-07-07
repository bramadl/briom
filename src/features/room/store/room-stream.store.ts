"use client";

import { proxy, useSnapshot } from "valtio";

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
 * corresponding DTO field.
 *
 * Small enough that Valtio is arguably overkill for this one alone —
 * kept on the same proxy pattern as `turn-stream.store.ts` purely for
 * consistency across the codebase, not because it needs Valtio's
 * fine-grained tracking (there's only one field).
 */
interface RoomStreamState {
	isTurnSlotClaimed: boolean;
}

export const roomStreamState = proxy<RoomStreamState>({
	isTurnSlotClaimed: false,
});

export const roomStreamActions = {
	setTurnSlotClaimed(claimed: boolean): void {
		roomStreamState.isTurnSlotClaimed = claimed;
	},

	reset(): void {
		roomStreamState.isTurnSlotClaimed = false;
	},
};

/**
 * @description
 * Consumed by `TurnProposals`/retry buttons/`DeliberationEditor`.
 * Room-conclusion is NOT checked here — callers combine this with
 * `!isConcluded` from `useRoom`.
 */
export function useIsTurnSlotClaimed(): boolean {
	return useSnapshot(roomStreamState).isTurnSlotClaimed;
}
