"use client";

import { proxy, useSnapshot } from "valtio";

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

interface TurnStreamState {
	activeTurnId: string | null;
	error: ActiveTurnError | null;

	/**
	 * @description
	 * Accumulated content for the currently-streaming turn, sourced
	 * directly from Inngest Realtime's `tokenAccumulated` topic — same
	 * cadence as BE's throttled DB flush inside `StreamConsumer`.
	 * Keyed by turnId even though only one turn streams at a time
	 * under the current sequential-turn assumption — this keeps stale
	 * content from a just-ended turn from ever being read by a newly
	 * active one for a single render before it's overwritten.
	 *
	 * NEVER read this whole object in a component — always go through
	 * `useLiveTurnContent(turnId)`. Valtio's `useSnapshot` tracks
	 * *access paths*, so reading `snap.liveContent[turnId]` inside a
	 * hook subscribes only to that key; reading `snap.liveContent`
	 * itself (the whole object) would subscribe to every key changing,
	 * defeating the point.
	 */
	liveContent: Record<string, string>;

	phase: ActiveTurnPhase;

	/**
	 * @description
	 * Whether `TurnProposals` should render. Driven entirely by
	 * `useTurnSubscriber` (Inngest Realtime) plus the optimistic
	 * `onSuccess` in `useInitiateTurnMutation`.
	 */
	proposalsVisible: boolean;
}

const initialState: TurnStreamState = {
	activeTurnId: null,
	phase: "idle",
	proposalsVisible: false,
	liveContent: {},
	error: null,
};

/**
 * @description
 * Valtio proxy for turn streaming state — replaces the old
 * `useTurnStore` Zustand store.
 *
 * Why Valtio here specifically: this state has two very different
 * access patterns living side by side — `liveContent` is high-frequency
 * (updated on every `tokenAccumulated` flush) but narrow (each consumer
 * only ever cares about ITS OWN turnId), while `phase`/`error`/
 * `activeTurnId` are low-frequency but need to fan out to several
 * unrelated guards (readonly checks, proposal visibility, retry
 * buttons). Zustand handled this by requiring hand-written scalar
 * selectors for every consumer (`useLiveTurnContent`, `useIsActiveTurn`,
 * etc.) to avoid over-rendering. Valtio's `useSnapshot` gets the same
 * fine-grained behavior automatically via property-access tracking —
 * the selector hooks below still exist for a clean call-site API and
 * for TypeScript inference, but they no longer need a comment
 * explaining why skipping them would be dangerous.
 *
 * Mutations happen directly on `turnStreamState` from
 * `turnStreamActions` — never destructure/spread the proxy itself in a
 * component render path, only ever read through `useSnapshot`.
 */
export const turnStreamState = proxy<TurnStreamState>({ ...initialState });

export const turnStreamActions = {
	/**
	 * @description
	 * `TurnInitiated`. BE never broadcasts this for moderator turns —
	 * every payload FE receives here is already participant-only.
	 */
	claimTurn(turnId: string): void {
		turnStreamState.activeTurnId = turnId;
		turnStreamState.phase = "pending";
		turnStreamState.error = null;
	},

	markStreaming(turnId: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "streaming";
	},

	setLiveContent(turnId: string, content: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.liveContent[turnId] = content;
	},

	settleTurn(turnId: string, content: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "settled";
		turnStreamState.activeTurnId = null;
		// Overwrite with the authoritative final content instead of
		// leaving whatever partial tail liveContent last held.
		turnStreamState.liveContent[turnId] = content;
	},

	failTurn(turnId: string, error: ActiveTurnError): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "failed";
		turnStreamState.activeTurnId = null;
		turnStreamState.error = error;
	},

	abandonTurn(turnId: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "abandoned";
		turnStreamState.activeTurnId = null;
	},

	/**
	 * @description
	 * Explicit cleanup for a settled/failed/abandoned turn's leftover
	 * `liveContent` entry — called by `useTurnStreaming` once it
	 * confirms the room DTO has caught up with real content, NOT
	 * automatically by settleTurn/failTurn/abandonTurn.
	 */
	clearLiveContent(turnId: string): void {
		if (!(turnId in turnStreamState.liveContent)) return;
		delete turnStreamState.liveContent[turnId];
	},

	/**
	 * @description
	 * Adopts a turn that's already `streaming` per the room DTO — used
	 * exclusively by `useTurnSubscriber`'s mount-time resume check, for
	 * the case where the client reconnects (refresh, HMR, navigate
	 * back) while BE is still mid-stream on some turn. Deliberately
	 * distinct from `claimTurn`: does NOT reset `error`, and seeds
	 * `liveContent[turnId]` with whatever content the DTO already had.
	 */
	resumeStreaming(turnId: string, knownContent: string): void {
		turnStreamState.activeTurnId = turnId;
		turnStreamState.phase = "streaming";
		turnStreamState.liveContent[turnId] = knownContent;
	},

	setProposalsVisible(visible: boolean): void {
		turnStreamState.proposalsVisible = visible;
	},

	reset(): void {
		turnStreamState.activeTurnId = null;
		turnStreamState.phase = "idle";
		turnStreamState.error = null;
		turnStreamState.proposalsVisible = false;
		turnStreamState.liveContent = {};
	},
};

// ─── Scalar read hooks — thin wrappers over useSnapshot ────────────────

export function useIsActiveTurn(turnId: string): boolean {
	return useSnapshot(turnStreamState).activeTurnId === turnId;
}

export function useActiveTurnPhase(): ActiveTurnPhase {
	return useSnapshot(turnStreamState).phase;
}

/**
 * @description
 * The active turn's error detail, populated straight from the `failed`
 * Inngest topic — this doesn't wait on a refetch.
 */
export function useActiveTurnError(): ActiveTurnError | null {
	return useSnapshot(turnStreamState).error;
}

/**
 * @description
 * Scalar per-turn selector for live streaming content. Only the
 * component instance whose `turnId` matches the active turn ever
 * re-renders on a new token — Valtio's access-path tracking means this
 * "just works" without the manual equality-check plumbing Zustand
 * needed for the same guarantee.
 */
export function useLiveTurnContent(turnId: string): string {
	return useSnapshot(turnStreamState).liveContent[turnId] ?? "";
}

/**
 * @description
 * Consumed by `TurnProposals`/retry buttons. Room-conclusion and
 * frozen/locked are NOT checked here — callers combine this with
 * `!isConcluded` and `room.state` from `useRoom`, and
 * `!useIsTurnSlotClaimed()` from the room stream store.
 */
export function useShouldShowProposals(): boolean {
	const snap = useSnapshot(turnStreamState);
	return snap.proposalsVisible || snap.activeTurnId === null;
}
