import { create, type ExtractState } from "zustand";
import { combine } from "zustand/middleware";

export type RoomFormStore = ExtractState<typeof useRoomFormStore>;

export const useRoomFormStore = create(
	combine({ shown: false }, (set) => ({
		show: () => set(() => ({ shown: true })),
		hide: () => set(() => ({ shown: false })),
		toggle: () => set((state) => ({ shown: !state.shown })),
		setShown: (shown: boolean) => set({ shown: shown }),
	})),
);
