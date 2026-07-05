import { create } from "zustand";

export type ActiveTurnPhase =
	| "idle"
	| "pending"
	| "streaming"
	| "settled"
	| "failed"
	| "abandoned";

interface TurnStoreState {
	/**
	 * @description
	 * `TurnAbandoned`. No-ops if turnId isn't the active one.
	 */
	abandonTurn: (turnId: string) => void;

	/**
	 * @description
	 * The one turn currently going through pending → streaming →
	 * settled/failed/abandoned. Sequential-only per current product
	 * requirement. Cleared back to `null` the moment the turn reaches any
	 * terminal phase — `phase` itself still reflects which terminal state
	 * it landed in for the one render cycle before the room refetch
	 * replaces this turn's card with whatever `useRoom` now says.
	 */
	activeTurnId: string | null;

	/**
	 * @description
	 * `TurnInitiated`. BE never broadcasts this for moderator turns —
	 * every payload FE receives here is already participant-only.
	 */
	claimTurn: (turnId: string) => void;

	/**
	 * @description
	 * `TurnFailed`. No-ops if turnId isn't the active one.
	 */
	failTurn: (turnId: string) => void;

	/**
	 * @description
	 * Accumulated content for the currently-streaming turn, sourced
	 * directly from Inngest Realtime's `tokenAccumulated` topic — same
	 * cadence as the BE's throttled DB flush inside `StreamConsumer`.
	 * Deliberately keyed by turnId (not just "the current content")
	 * even though only one turn streams at a time under the current
	 * sequential-turn requirement — this keeps stale content from a
	 * just-ended turn from ever being read by a newly-active one for a
	 * single render before it's overwritten.
	 *
	 * NEVER select this map directly — use `useLiveTurnContent(turnId)`,
	 * which returns a scalar string so only the one component whose
	 * `turnId` actually changed re-renders. Selecting the whole map here
	 * would re-render every subscriber on every single token.
	 */
	liveContent: Record<string, string>;

	/**
	 * @description
	 * `TurnStreamStarted`. No-ops if turnId isn't the active one.
	 */
	markStreaming: (turnId: string) => void;

	/**
	 * @description
	 * Mirrors the domain's `TurnState` status union exactly (see
	 * `turn.state.ts`), plus "idle" which only exists client-side (no active
	 * turn at all). "abandoned" is intentionally distinct from "failed" —
	 * BE's own doc comment on `TurnsEventSubscriber` says abandoned turns
	 * are removed from the sequence immediately, while failed turns render
	 * a `TurnFailed` card. Collapsing them would lose that distinction.
	 */
	phase: ActiveTurnPhase;

	/**
	 * @description
	 * Whether `TurnProposals` should render. Driven entirely by
	 * `useTurnSubscriber` (Inngest Realtime) plus the optimistic
	 * `onSuccess` in `useInitiateTurnMutation` — never by a
	 * component-local listener. `useProposals` reads this via
	 * `useProposalsVisible()` and combines it with its own query data,
	 * it does not set it directly.
	 */
	proposalsVisible: boolean;

	/**
	 * @description
	 * Nuclear bomb that resets everything–lol.
	 */
	reset: () => void;

	/**
	 * @description
	 * Appends to `liveContent[turnId]`. Called once per
	 * `tokenAccumulated` message — see `useTurnSubscriber`. Payload
	 * carries the FULL accumulated content so far (not a delta), so
	 * this replaces rather than concatenates.
	 */
	setLiveContent: (turnId: string, content: string) => void;

	/**
	 * @description
	 * No idea how to describe this, just look at the damn code.
	 */
	setProposalsVisible: (visible: boolean) => void;

	/**
	 * @description
	 * `TurnSettled`. No-ops if turnId isn't the active one. Also clears
	 * that turn's entry out of `liveContent` — once settled, the room
	 * refetch's `RoomTurnDTO.content` becomes the source of truth, so
	 * there's nothing left for `liveContent` to usefully hold onto.
	 */
	settleTurn: (turnId: string) => void;
}

const initialState = {
	activeTurnId: null,
	phase: "idle" as const,
	proposalsVisible: false,
	liveContent: {},
};

export const useTurnStore = create<TurnStoreState>((set, get) => ({
	...initialState,

	abandonTurn: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set((s) => {
			const nextContent = { ...s.liveContent };
			delete nextContent[turnId];
			return {
				phase: "abandoned",
				activeTurnId: null,
				liveContent: nextContent,
			};
		});
	},

	claimTurn: (turnId) => set({ activeTurnId: turnId, phase: "pending" }),

	failTurn: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set((s) => {
			const nextContent = { ...s.liveContent };
			delete nextContent[turnId];
			return {
				phase: "failed",
				activeTurnId: null,
				liveContent: nextContent,
			};
		});
	},

	markStreaming: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "streaming" });
	},

	reset: () => set({ ...initialState, liveContent: {} }),

	setLiveContent: (turnId, content) => {
		if (get().activeTurnId !== turnId) return;
		set((s) => ({ liveContent: { ...s.liveContent, [turnId]: content } }));
	},

	setProposalsVisible: (visible) => set({ proposalsVisible: visible }),

	settleTurn: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set((s) => {
			const nextContent = { ...s.liveContent };
			delete nextContent[turnId];
			return {
				phase: "settled",
				activeTurnId: null,
				liveContent: nextContent,
			};
		});
	},
}));

// ─── Granular selector hooks — one per consumer, minimal re-renders ────

export function useIsActiveTurn(turnId: string) {
	return useTurnStore((s) => s.activeTurnId === turnId);
}

export function useActiveTurnPhase() {
	return useTurnStore((s) => s.phase);
}

/**
 * @description
 * Scalar per-turn selector for live streaming content. Only the
 * `LiveParticipantTurn` instance whose `turnId` matches the active
 * turn ever re-renders on a new token — every other component
 * (including other turns' `StaticParticipantTurn` instances) is
 * untouched, since Zustand's default equality check skips notifying
 * subscribers whose selected value didn't change.
 */
export function useLiveTurnContent(turnId: string) {
	return useTurnStore((s) => s.liveContent[turnId] ?? "");
}

/**
 * @description
 * Consumed by `TurnProposals`/retry buttons. Room-conclusion and
 * frozen/locked are NOT checked here — callers combine this with
 * `!isConcluded` and `room.state` from `useRoom`, and
 * `!useIsTurnSlotClaimed()` from `useRoomStore`.
 */
export function useShouldShowProposals() {
	const proposalsVisible = useTurnStore((s) => s.proposalsVisible);
	const activeTurnId = useTurnStore((s) => s.activeTurnId);

	return proposalsVisible || activeTurnId === null;
}
