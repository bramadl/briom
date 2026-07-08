"use client";

import { proxy, useSnapshot } from "valtio";

export type ActiveTurnPhase =
	| "idle"
	| "pending"
	| "streaming"
	| "settled"
	| "failed"
	| "abandoned";

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
	 * True from the moment a turn is submitted (onMutate) until either the
	 * server confirms it (claimTurn takes over via activeTurnId) or the
	 * mutation fails. Lets us hide proposals optimistically without a
	 * setTimeout and without a manually-toggled visibility flag.
	 */
	isOptimisticallyPending: boolean;
	liveContent: Record<string, string>;
	phase: ActiveTurnPhase;
	settledTurnIds: Set<string>;
	/**
	 * The turn the store is currently "about" for rendering purposes —
	 * i.e. whose phase/error/content the most recent ParticipantTurn
	 * should read. Unlike activeTurnId, this is NOT cleared just because
	 * a turn reaches a terminal phase (settled/failed/abandoned), and it
	 * is NOT auto-released when some other cache happens to catch up.
	 * It's only ever overwritten by claimTurn/resumeStreaming (a new turn
	 * starting) or wiped by hardReset (leaving the room). This is
	 * deliberately dumb: earlier versions tried to be clever and release
	 * it as soon as the React Query room cache "confirmed" the terminal
	 * status, which raced against other independent invalidations
	 * (e.g. TurnSlotReleased refetching the room) and caused isActive to
	 * flip out from under a component mid-render — visible as an error
	 * message or Retry button changing a tick after the failure banner
	 * first appeared. Keeping one turn's data around in the store costs
	 * nothing, so there's no need to race to free it.
	 */
	trackedTurnId: string | null;
}

const initialState: TurnStreamState = {
	activeTurnId: null,
	trackedTurnId: null,
	phase: "idle",
	isOptimisticallyPending: false,
	liveContent: {},
	error: null,
	settledTurnIds: new Set(),
};

export const turnStreamState = proxy<TurnStreamState>({ ...initialState });

// Phases in which no turn is in-flight, i.e. it's safe to show proposals.
const IDLE_PHASES: ReadonlySet<ActiveTurnPhase> = new Set([
	"idle",
	"settled",
	"failed",
	"abandoned",
]);

export const turnStreamActions = {
	/**
	 * Call this on mutation submit (onMutate), before the server has
	 * confirmed which turn was claimed. Hides proposals immediately without
	 * needing a manual visibility flag.
	 */
	beginOptimisticTurn(): void {
		turnStreamState.isOptimisticallyPending = true;
	},

	/**
	 * Call this on mutation error to release the optimistic hide if the
	 * turn never actually started.
	 */
	cancelOptimisticTurn(): void {
		turnStreamState.isOptimisticallyPending = false;
	},

	claimTurn(turnId: string): void {
		turnStreamState.activeTurnId = turnId;
		turnStreamState.trackedTurnId = turnId;
		turnStreamState.phase = "pending";
		turnStreamState.error = null;
		turnStreamState.isOptimisticallyPending = false;
		turnStreamState.settledTurnIds.delete(turnId);
	},

	markStreaming(turnId: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "streaming";
	},

	setLiveContent(turnId: string, content: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.liveContent[turnId] = content;
	},

	appendLiveContent(turnId: string, token: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.liveContent[turnId] =
			(turnStreamState.liveContent[turnId] ?? "") + token;
	},

	settleTurn(turnId: string, content: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "settled";
		turnStreamState.activeTurnId = null;
		turnStreamState.liveContent[turnId] = content;
		turnStreamState.settledTurnIds.add(turnId);
	},

	failTurn(turnId: string, error: ActiveTurnError): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "failed";
		turnStreamState.activeTurnId = null;
		turnStreamState.error = error;
		turnStreamState.settledTurnIds.add(turnId);
	},

	abandonTurn(turnId: string): void {
		if (turnStreamState.activeTurnId !== turnId) return;
		turnStreamState.phase = "abandoned";
		turnStreamState.activeTurnId = null;
		turnStreamState.settledTurnIds.add(turnId);
	},

	/**
	 * Manual utility, not called automatically anywhere. Drops the raw
	 * live-streamed text for a turn (e.g. once you know for certain the
	 * settled/cached content has fully taken over) without touching
	 * phase/error/trackedTurnId. Kept separate from claimTurn/hardReset
	 * so callers can't accidentally use it to "release" a turn's tracked
	 * state — see the trackedTurnId doc comment for why that was a bug.
	 */
	clearLiveContent(turnId: string): void {
		if (turnId in turnStreamState.liveContent) {
			delete turnStreamState.liveContent[turnId];
		}
		turnStreamState.settledTurnIds.delete(turnId);
	},

	resumeStreaming(turnId: string, knownContent: string): void {
		turnStreamState.activeTurnId = turnId;
		turnStreamState.trackedTurnId = turnId;
		turnStreamState.phase = "streaming";
		turnStreamState.liveContent[turnId] = knownContent;
		turnStreamState.settledTurnIds.delete(turnId);
	},

	/**
	 * @description
	 * Called when the moderator's turn slot is released (TurnSlotReleased)
	 * — this just means "a new turn can now be claimed", NOT "throw away
	 * whatever the last turn's outcome was". Deliberately does NOT touch
	 * trackedTurnId/phase/error: those belong to whichever turn last ran
	 * and stay put until superseded by a new claimTurn call. Stomping
	 * them here previously caused a regression where a failed turn would
	 * flicker back to "shaping perspective..." the instant the slot
	 * released, because isActive dropped to false a beat before the
	 * cache had the fresh turn.status to fall back on.
	 */
	reset(): void {
		turnStreamState.activeTurnId = null;
		turnStreamState.isOptimisticallyPending = false;
	},

	hardReset(): void {
		turnStreamState.activeTurnId = null;
		turnStreamState.trackedTurnId = null;
		turnStreamState.phase = "idle";
		turnStreamState.error = null;
		turnStreamState.isOptimisticallyPending = false;
		turnStreamState.liveContent = {};
		turnStreamState.settledTurnIds = new Set();
	},
};

export function useIsActiveTurn(turnId: string): boolean {
	return useSnapshot(turnStreamState).trackedTurnId === turnId;
}

export function useActiveTurnId(): string | null {
	return useSnapshot(turnStreamState).activeTurnId;
}

export function useActiveTurnPhase(): ActiveTurnPhase {
	return useSnapshot(turnStreamState).phase;
}

export function useActiveTurnError(): ActiveTurnError | null {
	return useSnapshot(turnStreamState).error;
}

export function useLiveTurnContent(turnId: string): string {
	return useSnapshot(turnStreamState).liveContent[turnId] ?? "";
}

/**
 * @description
 * Derived, not manually toggled: proposals are safe to show only when
 * there's no active turn and the phase is one of the "settled" states.
 * This removes the setTimeout-based visibility flag entirely, so there's
 * no window where a stale timeout can flip visibility back on after a
 * new turn has already started.
 */
export function useShouldShowProposals(): boolean {
	const snap = useSnapshot(turnStreamState);
	return (
		snap.activeTurnId === null &&
		!snap.isOptimisticallyPending &&
		IDLE_PHASES.has(snap.phase)
	);
}
