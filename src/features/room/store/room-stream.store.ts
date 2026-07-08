"use client";

import { proxy, useSnapshot } from "valtio";

interface RoomStreamState {
	isTransitioning: boolean;
	isTurnSlotClaimed: boolean;
}

export const roomStreamState = proxy<RoomStreamState>({
	isTransitioning: false,
	isTurnSlotClaimed: false,
});

export const roomStreamActions = {
	setTransitioning(transitioning: boolean): void {
		roomStreamState.isTransitioning = transitioning;
	},

	setTurnSlotClaimed(claimed: boolean): void {
		roomStreamState.isTurnSlotClaimed = claimed;
	},

	reset(): void {
		roomStreamState.isTransitioning = false;
		roomStreamState.isTurnSlotClaimed = false;
	},
};

export function useRoomTransition(): boolean {
	return useSnapshot(roomStreamState).isTransitioning;
}

export function useIsTurnSlotClaimed(): boolean {
	return useSnapshot(roomStreamState).isTurnSlotClaimed;
}
