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
	liveContent: Record<string, string>;
	phase: ActiveTurnPhase;
	proposalsVisible: boolean;
	settledTurnIds: Set<string>;
}

const initialState: TurnStreamState = {
	activeTurnId: null,
	phase: "idle",
	proposalsVisible: true,
	liveContent: {},
	error: null,
	settledTurnIds: new Set(),
};

export const turnStreamState = proxy<TurnStreamState>({ ...initialState });

export const turnStreamActions = {
	claimTurn(turnId: string): void {
		turnStreamState.activeTurnId = turnId;
		turnStreamState.phase = "pending";
		turnStreamState.error = null;
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
	},

	resumeStreaming(turnId: string, knownContent: string): void {
		turnStreamState.activeTurnId = turnId;
		turnStreamState.phase = "streaming";
		turnStreamState.liveContent[turnId] = knownContent;
		turnStreamState.settledTurnIds.delete(turnId);
	},

	setProposalsVisible(visible: boolean): void {
		turnStreamState.proposalsVisible = visible;
	},

	reset(): void {
		const preservedContent: Record<string, string> = {};
		for (const turnId of turnStreamState.settledTurnIds) {
			if (turnId in turnStreamState.liveContent) {
				preservedContent[turnId] = turnStreamState.liveContent[turnId];
			}
		}

		turnStreamState.activeTurnId = null;
		turnStreamState.phase = "idle";
		turnStreamState.error = null;
		turnStreamState.proposalsVisible = false;
		turnStreamState.liveContent = preservedContent;
	},

	hardReset(): void {
		turnStreamState.activeTurnId = null;
		turnStreamState.phase = "idle";
		turnStreamState.error = null;
		turnStreamState.proposalsVisible = false;
		turnStreamState.liveContent = {};
		turnStreamState.settledTurnIds = new Set();
	},
};

export function useIsActiveTurn(turnId: string): boolean {
	return useSnapshot(turnStreamState).activeTurnId === turnId;
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
	return snap.proposalsVisible || snap.activeTurnId === null;
}
