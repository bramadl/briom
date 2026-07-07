import { create } from "zustand";

interface TurnCollapseState {
	/**
	 * @description
	 * Called from `useInitiateTurnMutation`'s `onMutate`, at the exact
	 * moment a new moderator turn is optimistically created. Clears
	 * ALL manual state — both force-expanded (including anything rule
	 * 3 was keeping open) and force-collapsed — except for the ids
	 * passed in `keepExpandedIds`. In practice this is called with an
	 * empty array: the newly-created moderator turn and its
	 * participant placeholder don't need to be in this set at all,
	 * since they're `isLatest` by construction and rule 1 already
	 * covers them.
	 */
	collapseAllExcept: (keepExpandedIds: string[]) => void;

	/**
	 * @description
	 * IDs the user has explicitly collapsed. Takes precedence over
	 * `forceExpandedIds` — this is what lets a moderator manually
	 * collapse a turn that rule 3 would otherwise keep open.
	 */
	forceCollapsedIds: Set<string>;

	/**
	 * @description
	 * IDs the user (or `forceExpandOnSettle`) has explicitly expanded,
	 * independent of "latest" status. This is what keeps rule 3 alive:
	 * a participant turn that just settled is added here, so it stays
	 * expanded even after a newer moderator turn makes it no longer
	 * "latest".
	 */
	forceExpandedIds: Set<string>;

	/**
	 * @description
	 * Rule 3's entry point. Called once, from `ParticipantTurn`, at
	 * the instant a turn's `isActive` flips from `true` to `false`
	 * (i.e. streaming just finished). Adds the turn to
	 * `forceExpandedIds` so it stays open even after it stops being
	 * `isLatest`. A no-op if the moderator already manually collapsed
	 * it in the meantime (that intent wins — checked by the caller,
	 * not here, since this store doesn't know about a turn's
	 * `isActive` history).
	 */
	forceExpandOnSettle: (turnId: string) => void;

	/**
	 * @description
	 * Toggles a single turn's expanded state, given its CURRENT
	 * resolved state (from `useIsTurnExpanded`). Moving a turn from
	 * expanded -> collapsed always lands it in `forceCollapsedIds`
	 * (even if it was expanded only because of rule 3, not a manual
	 * expand) — this is what lets the moderator override rule 3.
	 * Moving collapsed -> expanded lands it in `forceExpandedIds`.
	 */
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
