import { create } from "zustand";

interface SynthesisSheetState {
	close: () => void;
	isOpen: boolean;
	open: () => void;
}

export const useSynthesisSheetStore = create<SynthesisSheetState>((set) => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
}));
