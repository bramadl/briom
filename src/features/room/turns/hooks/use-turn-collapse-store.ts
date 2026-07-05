import { create } from "zustand";

/**
 * @description
 * Pure UI interaction state — which turns are manually expanded.
 * Deliberately separate from `useTurnStore`/`useRoomStore`: nothing
 * here is ever set by a realtime event. It's set by (a) the user
 * clicking a toggle, or (b) `collapseAllExpanded()` as a side-effect of
 * moderator actions (initiating a turn, and later accepting a
 * proposal) — but the trigger for (b) is a mutation's `onMutate`, not
 * a subscription handler, so this store has no dependency on either
 * Supabase or Inngest wiring.
 */
interface TurnCollapseState {
	/**
	 * @description
	 * Force-collapses every turn currently tracked as expanded. Called
	 * from `useInitiateTurnMutation`'s `onMutate`, at the exact moment a
	 * new moderator turn is optimistically created — the newly-created
	 * moderator turn and its participant placeholder are never in this
	 * set to begin with, so they render expanded by default (see
	 * `useIsTurnExpanded`'s doc comment on the default-collapsed
	 * convention). This is intentionally unconditional: a turn the user
	 * manually expanded moments ago is still collapsed here, trading
	 * "preserve user's manual expand" for a simpler mental model and a
	 * smaller DOM/layout footprint once a new turn starts streaming.
	 */
	collapseAllExpanded: () => void;

	/**
	 * @description
	 * IDs of turns the user (or the app) has explicitly expanded.
	 * Default-collapsed convention: a turn's collapsed state is
	 * `!expandedTurnIds.has(id)`, so a turn absent from this set renders
	 * collapsed. Consumers should NEVER select this whole Set directly —
	 * use `useIsTurnExpanded(id)` instead, which returns a scalar
	 * boolean so unrelated turns don't re-render when one turn toggles.
	 */
	expandedTurnIds: Set<string>;

	/**
	 * @description
	 * Toggles a single turn's expanded state. Safe to call for any
	 * turnId regardless of current membership in `expandedTurnIds`.
	 */
	toggleExpanded: (turnId: string) => void;
}

export const useTurnCollapseStore = create<TurnCollapseState>((set, get) => ({
	expandedTurnIds: new Set<string>(),

	toggleExpanded: (turnId) => {
		set((s) => {
			const next = new Set(s.expandedTurnIds);
			if (next.has(turnId)) next.delete(turnId);
			else next.add(turnId);
			return { expandedTurnIds: next };
		});
	},

	collapseAllExpanded: () => {
		// Only replaces the reference when there's actually something to
		// clear — skips a redundant `Set` allocation + store update on
		// every optimistic send once the set is already empty (the
		// common case: nothing was manually expanded before sending).
		if (get().expandedTurnIds.size === 0) return;
		set({ expandedTurnIds: new Set() });
	},
}));

/**
 * @description
 * Scalar per-turn selector — returns `true` only if this specific
 * `turnId` is in `expandedTurnIds`. Every `StaticParticipantTurn`/
 * `ModeratorTurn` should use this instead of reading `expandedTurnIds`
 * directly: Zustand's default equality check is reference-based, so
 * selecting the whole Set would re-render every turn in the sequence
 * whenever ANY turn toggles or `collapseAllExpanded` fires — exactly
 * the re-render blast radius `ParticipantTurn`'s `memo` wrapper was
 * built to avoid. Selecting a scalar boolean here means Zustand only
 * notifies the one turn whose membership actually changed.
 */
export function useIsTurnExpanded(turnId: string) {
	return useTurnCollapseStore((s) => s.expandedTurnIds.has(turnId));
}
