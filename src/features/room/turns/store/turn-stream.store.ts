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
	isOptimisticallyPending: boolean;
	liveContent: Record<string, string>;
	phase: ActiveTurnPhase;
	settledTurnIds: Set<string>;
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
	beginOptimisticTurn(): void {
		turnStreamState.isOptimisticallyPending = true;
	},

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

	clearLiveContent(turnId: string): void {
		if (turnId in turnStreamState.liveContent) {
			delete turnStreamState.liveContent[turnId];
		}
		turnStreamState.settledTurnIds.delete(turnId);
		if (turnStreamState.trackedTurnId === turnId) {
			turnStreamState.trackedTurnId = null;
		}
	},

	resumeStreaming(turnId: string, knownContent: string): void {
		turnStreamState.activeTurnId = turnId;
		turnStreamState.trackedTurnId = turnId;
		turnStreamState.phase = "streaming";
		turnStreamState.liveContent[turnId] = knownContent;
		turnStreamState.settledTurnIds.delete(turnId);
	},

	reset(): void {
		const preservedContent: Record<string, string> = {};
		for (const turnId of turnStreamState.settledTurnIds) {
			if (turnId in turnStreamState.liveContent) {
				preservedContent[turnId] = turnStreamState.liveContent[turnId];
			}
		}

		turnStreamState.activeTurnId = null;
		turnStreamState.trackedTurnId = null;
		turnStreamState.phase = "idle";
		turnStreamState.error = null;
		turnStreamState.isOptimisticallyPending = false;
		turnStreamState.liveContent = preservedContent;
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

export function useShouldShowProposals(): boolean {
	const snap = useSnapshot(turnStreamState);
	return (
		snap.activeTurnId === null &&
		!snap.isOptimisticallyPending &&
		IDLE_PHASES.has(snap.phase)
	);
}
