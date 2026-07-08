import { create } from "zustand";

interface TurnCollapseState {
	collapseAllExcept: (keepExpandedIds: string[]) => void;
	forceCollapsedIds: Set<string>;
	forceExpandedIds: Set<string>;
	forceExpandOnSettle: (turnId: string) => void;
	toggleExpanded: (turnId: string, currentlyExpanded: boolean) => void;
}

export const useTurnCollapseStore = create<TurnCollapseState>((set) => ({
	forceExpandedIds: new Set<string>(),
	forceCollapsedIds: new Set<string>(),

	collapseAllExcept: (keepExpandedIds) => {
		set(() => ({
			forceExpandedIds: new Set(keepExpandedIds),
			forceCollapsedIds: new Set<string>(),
		}));
	},

	toggleExpanded: (turnId, currentlyExpanded) => {
		set((s) => {
			const forceExpandedIds = new Set(s.forceExpandedIds);
			const forceCollapsedIds = new Set(s.forceCollapsedIds);

			if (currentlyExpanded) {
				forceExpandedIds.delete(turnId);
				forceCollapsedIds.add(turnId);
			} else {
				forceCollapsedIds.delete(turnId);
				forceExpandedIds.add(turnId);
			}

			return { forceExpandedIds, forceCollapsedIds };
		});
	},

	forceExpandOnSettle: (turnId) => {
		set((s) => {
			if (s.forceExpandedIds.has(turnId)) return s;
			const forceExpandedIds = new Set(s.forceExpandedIds);
			forceExpandedIds.add(turnId);
			return { forceExpandedIds };
		});
	},
}));

export function useIsTurnExpanded(
	turnId: string,
	opts: { isLatest: boolean; isActiveStreaming: boolean },
) {
	return useTurnCollapseStore((s) => {
		if (opts.isActiveStreaming) return true;

		if (s.forceCollapsedIds.has(turnId)) return false;

		if (opts.isLatest) return true;
		if (s.forceExpandedIds.has(turnId)) return true;

		return false;
	});
}
