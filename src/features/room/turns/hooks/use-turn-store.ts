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

/**
 * @description
 * Mirrors `ITurnRealtimePublisher.publishFailed`'s payload shape
 * (minus `turnId`, which is the map key here) — carried in full so
 * `TurnFailed` can render immediately off the realtime message alone,
 * without waiting on the `invalidateRoom()` refetch that fires
 * alongside `failTurn`.
 */
export interface ActiveTurnError {
	isRetryable?: boolean;
	kind: string;
	message: string;
	retryAfter?: number;
}

interface TurnState {
	/**
	 * @description
	 * `TurnAbandoned`. No-ops if turnId isn't the active one.
	 */
	abandonTurn: (turnId: string) => void;

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
	 * Explicit cleanup for a settled/failed/abandoned turn's leftover
	 * `liveContent` entry — called by the consumer (`useTurnStreaming`)
	 * once it confirms the room DTO has caught up with real content,
	 * NOT automatically by settleTurn/failTurn/abandonTurn. See those
	 * methods' comment for why the old auto-clear-on-settle behavior
	 * was removed.
	 */
	clearLiveContent: (turnId: string) => void;

	/**
	 * @description
	 * The active turn's error detail, set only when `phase === "failed"`.
	 * Read via `useActiveTurnError()`. Cleared whenever a new turn is
	 * claimed.
	 */
	error: ActiveTurnError | null;

	/**
	 * @description
	 * `TurnFailed`. No-ops if turnId isn't the active one.
	 */
	failTurn: (turnId: string, error: ActiveTurnError) => void;

	/**
	 * @description
	 * Accumulated content for the currently-streaming turn, sourced
	 * directly from Inngest Realtime's `tokenAccumulated` topic — same
	 * cadence as the BE's throttled DB flush inside `StreamConsumer`.
	 * Deliberately keyed by turnId (not just "the current content")
	 * even though only one turn streams at a time under the current
	 * sequential-turn assumption — this keeps stale content from a
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

	reset: () => void;

	/**
	 * @description
	 * Adopts a turn that's already `streaming` per the room DTO — used
	 * exclusively by `useTurnSubscriber`'s mount-time resume check, for
	 * the case where the client reconnects (refresh, HMR, navigate back)
	 * while BE is still mid-stream on some turn. Without this, the store
	 * comes up as `activeTurnId: null`, so every subsequent
	 * `tokenAccumulated`/`settled` message for that turn is silently
	 * dropped by the `activeTurnId !== turnId` guards in `setLiveContent`
	 * /`settleTurn`/`failTurn` — the user is left staring at whatever
	 * partial `content` the DTO snapshot had at mount, forever, until
	 * some unrelated event forces a room refetch.
	 *
	 * Deliberately distinct from `claimTurn`: this does NOT reset `error`
	 * (a resumed turn was never in a fresh "just claimed" state) and it
	 * seeds `liveContent[turnId]` with whatever content the DTO already
	 * had, rather than leaving it empty — that seed is what keeps the
	 * turn rendering its last-known text right away instead of a blank
	 * card for the (network-round-trip-sized) window until the next
	 * realtime message arrives.
	 */
	resumeStreaming: (turnId: string, knownContent: string) => void;

	/**
	 * @description
	 * Appends to `liveContent[turnId]`. Called once per
	 * `tokenAccumulated` message — see `useTurnSubscriber`. Payload
	 * carries the FULL accumulated content so far (not a delta), so
	 * this replaces rather than concatenates.
	 */
	setLiveContent: (turnId: string, content: string) => void;

	setProposalsVisible: (visible: boolean) => void;

	/**
	 * @description
	 * `TurnSettled`. No-ops if turnId isn't the active one. Also clears
	 * that turn's entry out of `liveContent` — once settled, the room
	 * refetch's `RoomTurnDTO.content` becomes the source of truth, so
	 * there's nothing left for `liveContent` to usefully hold onto.
	 */
	settleTurn: (turnId: string, content: string) => void;
}

const initialState = {
	activeTurnId: null,
	phase: "idle" as const,
	proposalsVisible: false,
	liveContent: {},
	error: null,
};

export const useTurnStore = create<TurnState>((set, get) => ({
	...initialState,

	setProposalsVisible: (visible) => set({ proposalsVisible: visible }),

	claimTurn: (turnId) =>
		set({ activeTurnId: turnId, phase: "pending", error: null }),

	markStreaming: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "streaming" });
	},

	setLiveContent: (turnId, content) => {
		if (get().activeTurnId !== turnId) return;
		set((s) => ({ liveContent: { ...s.liveContent, [turnId]: content } }));
	},

	settleTurn: (turnId, content) => {
		if (get().activeTurnId !== turnId) return;
		set((s) => ({
			phase: "settled",
			activeTurnId: null,
			// Overwrite with the authoritative final content instead of
			// leaving whatever partial tail liveContent last held — this
			// is what actually closes the gap, not just the fallback.
			liveContent: { ...s.liveContent, [turnId]: content },
		}));
	},

	failTurn: (turnId, error) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "failed", activeTurnId: null, error });
	},

	abandonTurn: (turnId) => {
		if (get().activeTurnId !== turnId) return;
		set({ phase: "abandoned", activeTurnId: null });
	},

	clearLiveContent: (turnId) =>
		set((s) => {
			if (!(turnId in s.liveContent)) return s;
			const next = { ...s.liveContent };
			delete next[turnId];
			return { liveContent: next };
		}),

	resumeStreaming: (turnId, knownContent) =>
		set((s) => ({
			activeTurnId: turnId,
			phase: "streaming",
			liveContent: { ...s.liveContent, [turnId]: knownContent },
		})),

	reset: () => set({ ...initialState, liveContent: {} }),
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
 * The active turn's error detail, populated straight from the
 * `failed` Inngest topic — see `ActiveTurnError`'s doc comment for why
 * this doesn't wait on a refetch.
 */
export function useActiveTurnError() {
	return useTurnStore((s) => s.error);
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
