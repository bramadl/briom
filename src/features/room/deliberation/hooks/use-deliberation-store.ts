import { create } from "zustand";

/**
 * @description
 * Mirrors the domain's `TurnState` status union exactly (see
 * `turn.state.ts`), plus "idle" which only exists client-side (no active
 * turn at all). "abandoned" is intentionally distinct from "failed" —
 * BE's own doc comment on `TurnsEventSubscriber` says abandoned turns
 * are removed from the sequence immediately, while failed turns render
 * a `TurnFailed` card. Collapsing them would lose that distinction.
 */
export type ActiveTurnPhase =
	| "idle"
	| "pending"
	| "streaming"
	| "settled"
	| "failed"
	| "abandoned";

interface DeliberationState {
	/**
	 * @description
	 * `TurnAbandoned`. No-ops if turnId isn't the active one.
	 */
	abandonTurn: (turnId: string) => void;

	// ─── Turn-level (from TurnsEventSubscriber registry) ──────────────

	/**
	 * @description
	 * The one turn currently going through pending → streaming →
	 * settled/failed/abandoned. Sequential-only per current product
	 * assumption. Cleared back to `null` the moment the turn reaches any
	 * terminal phase — `phase` itself still reflects which terminal state
	 * it landed in for the one render cycle before the room refetch
	 * replaces this turn's card with whatever `useRoom` now says.
	 */
	activeTurnId: string | null;

	/**
	 * @description
	 * `TurnInitiated`. BE never broadcasts this for moderator turns — every payload FE receives here is already participant-only.
	 */
	claimTurn: (turnId: string) => void;

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
	 * `TurnFailed`. No-ops if turnId isn't the active one.
	 */
	failTurn: (turnId: string) => void;

	// ─── Room-level (from RoomsEventSubscriber registry) ──────────────
	//
	// NOTE: `isConcluded` deliberately does NOT live here. Deliberation
	// started/concluded is already a first-class field on the room DTO
	// (`room.info.metadata.status`), so `useRoom` is the source of truth
	// for it — this store only needs to trigger a room-query invalidation
	// when those events fire, never hold a parallel copy. Same reasoning
	// would apply to `isFrozen`/`isLocked`/`isTurnSlotClaimed` if/when
	// those get their own DTO fields; until then they're transient
	// client-only state with nothing to reconcile against.

	/**
	 * @description
	 * `RoomFrozen`/`RoomUnfrozen`. Shows a frozen-notice banner when true.
	 */
	isFrozen: boolean;

	/**
	 * @description
	 * `RoomLocked`/`RoomUnlocked`. Same UI treatment as frozen per BE's doc comment.
	 */
	isLocked: boolean;

	/**
	 * `TurnSlotClaimed`/`TurnSlotReleased`. While claimed: disable input,
	 * hide proposals + retry button.
	 */
	isTurnSlotClaimed: boolean;

	/**
	 * @description
	 * `TurnStreamStarted`. No-ops if turnId isn't the active one.
	 */
	markStreaming: (turnId: string) => void;
	phase: ActiveTurnPhase;

	/**
	 * @description
	 * Whether `TurnProposals` should render. Driven entirely by
	 * `useDeliberationRealtime` (the single subscription point) plus the
	 * optimistic `onSuccess` in `useInitiateTurnMutation` — never by a
	 * component-local listener. `useProposals` reads this via
	 * `useProposalsVisible()` and combines it with its own query data,
	 * it does not set it directly.
	 */
	proposalsVisible: boolean;

	reset: () => void;

	// ─── Actions ────────────────────────────────────────────────────────

	setFrozen: (frozen: boolean) => void;
	setLocked: (locked: boolean) => void;
	setProposalsVisible: (visible: boolean) => void;
	setTurnSlotClaimed: (claimed: boolean) => void;

	/**
	 * @description
	 * `TurnSettled`. No-ops if turnId isn't the active one.
	 */
	settleTurn: (turnId: string) => void;

	/**
	 * @description
	 * Toggles a single turn's expanded state. Safe to call for any
	 * turnId regardless of current membership in `expandedTurnIds`.
	 */
	toggleExpanded: (turnId: string) => void;
}

const initialState = {
	isFrozen: false,
	isLocked: false,
	isTurnSlotClaimed: false,
	activeTurnId: null,
	phase: "idle" as const,
	expandedTurnIds: new Set<string>(),
	proposalsVisible: false,
};

export const useDeliberationStore = create<DeliberationState>((set, get) => ({
	...initialState,

	setFrozen: (frozen) => set({ isFrozen: frozen }),
	setLocked: (locked) => set({ isLocked: locked }),
	setTurnSlotClaimed: (claimed) => set({ isTurnSlotClaimed: claimed }),
	setProposalsVisible: (visible) => set({ proposalsVisible: visible }),

	claimTurn: (turnId) => set({ activeTurnId: turnId, phase: "pending" }),

	markStreaming: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "streaming" });
	},

	settleTurn: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "settled", activeTurnId: null });
	},

	failTurn: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "failed", activeTurnId: null });
	},

	abandonTurn: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "abandoned", activeTurnId: null });
	},

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

	reset: () => set({ ...initialState, expandedTurnIds: new Set() }),
}));

// ─── Granular selector hooks — one per consumer, minimal re-renders ────

export function useIsActiveTurn(turnId: string) {
	return useDeliberationStore((s) => s.activeTurnId === turnId);
}

export function useActiveTurnPhase() {
	return useDeliberationStore((s) => s.phase);
}

/**
 * @description
 * Consumed by `DeliberationEditor`. Deliberately does NOT include
 * `isConcluded` — that flag lives on `useRoom` (`room.info.metadata.status`)
 * since it's already a DTO field. Callers should combine:
 * `!isConcluded && !useIsRoomReadOnly()`.
 */
export function useIsRoomReadOnly() {
	return useDeliberationStore(
		(s) => s.isFrozen || s.isLocked || s.isTurnSlotClaimed,
	);
}

export function useIsRoomFrozenOrLocked() {
	return useDeliberationStore((s) => ({
		isFrozen: s.isFrozen,
		isLocked: s.isLocked,
	}));
}

/**
 * @description
 * Consumed by `TurnProposals`/retry buttons. Room-conclusion is NOT
 * checked here — callers combine this with `!isConcluded` from `useRoom`
 * the same way `useIsRoomReadOnly` expects.
 */
export function useShouldShowProposals() {
	const proposalsVisible = useDeliberationStore((s) => s.proposalsVisible);

	return useDeliberationStore(
		(s) =>
			proposalsVisible ||
			(!s.isTurnSlotClaimed &&
				!s.isFrozen &&
				!s.isLocked &&
				s.activeTurnId === null),
	);
}

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
	return useDeliberationStore((s) => s.expandedTurnIds.has(turnId));
}
