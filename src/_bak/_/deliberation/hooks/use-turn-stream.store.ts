import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type StreamingTurnStatus =
	| "pending"
	| "streaming"
	| "settled"
	| "failed";

export interface StreamingTurn {
	authorType: "moderator" | "participant";
	content: string;
	error: { kind: string; message: string; occurredAt: string } | null;
	id: string;
	participantId: string | null;
	roomId: string;
	sequence: number;
	status: StreamingTurnStatus;
}

interface TurnStreamState {
	appendToken: (turnId: string, token: string) => void;
	clearRoom: (roomId: string) => void;
	failTurn: (
		turnId: string,
		error: { kind: string; message: string; occurredAt: string },
	) => void;
	finalizeTurn: (turnId: string, content: string) => void;
	getTurn: (turnId: string) => StreamingTurn | undefined;
	initTurn: (turn: Omit<StreamingTurn, "content" | "status" | "error">) => void;
	isAnyTurnStreaming: () => boolean;
	startTurn: (turnId: string) => void;
	streamingTurnId: string | null;
	turns: Map<string, StreamingTurn>;
}

export const useTurnStreamStore = create<TurnStreamState>()(
	subscribeWithSelector((set, get) => ({
		turns: new Map(),
		streamingTurnId: null,

		initTurn(turn) {
			set((state) => {
				const next = new Map(state.turns);
				next.set(turn.id, {
					...turn,
					content: "",
					status: "pending",
					error: null,
				});
				return { turns: next };
			});
		},

		startTurn(turnId) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, { ...existing, status: "streaming" });
				return { turns: next, streamingTurnId: turnId };
			});
		},

		appendToken(turnId, token) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, {
					...existing,
					content: existing.content + token,
					status: "streaming",
				});
				return { turns: next, streamingTurnId: turnId };
			});
		},

		finalizeTurn(turnId, content) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, { ...existing, content, status: "settled" });
				return {
					turns: next,
					streamingTurnId:
						state.streamingTurnId === turnId ? null : state.streamingTurnId,
				};
			});
		},

		failTurn(turnId, error) {
			set((state) => {
				const existing = state.turns.get(turnId);
				if (!existing) return state;

				const next = new Map(state.turns);
				next.set(turnId, { ...existing, status: "failed", error });
				return {
					turns: next,
					streamingTurnId:
						state.streamingTurnId === turnId ? null : state.streamingTurnId,
				};
			});
		},

		clearRoom(roomId) {
			set((state) => {
				const next = new Map(state.turns);
				for (const [id, turn] of next) {
					if (turn.roomId === roomId) next.delete(id);
				}
				return {
					turns: next,
					streamingTurnId:
						state.streamingTurnId &&
						state.turns.get(state.streamingTurnId)?.roomId === roomId
							? null
							: state.streamingTurnId,
				};
			});
		},

		getTurn(turnId) {
			return get().turns.get(turnId);
		},

		isAnyTurnStreaming() {
			return get().streamingTurnId !== null;
		},
	})),
);
