import type { QueryClient } from "@tanstack/react-query";

import { patchDeliberation } from "./query-patchers";

interface PendingTurn {
	roomId: string;
	text: string;
}

class TokenBufferManager {
	private pending = new Map<string, PendingTurn>();
	private rafHandle: number | null = null;
	private activeQueryClient: QueryClient | null = null;
	private isDestroyed = false;

	buffer(
		queryClient: QueryClient,
		roomId: string,
		turnId: string,
		token: string,
	): void {
		if (this.isDestroyed) return;

		const existing = this.pending.get(turnId);
		this.pending.set(turnId, {
			roomId,
			text: (existing?.text ?? "") + token,
		});

		this.activeQueryClient = queryClient;
		this.scheduleFlush();
	}

	flush(): void {
		if (this.pending.size === 0 || !this.activeQueryClient || this.isDestroyed)
			return;
		this.drain(this.activeQueryClient);
	}

	destroy(): void {
		this.isDestroyed = true;
		if (this.rafHandle !== null) {
			cancelAnimationFrame(this.rafHandle);
			this.rafHandle = null;
		}
		this.pending.clear();
		this.activeQueryClient = null;
	}

	private scheduleFlush(): void {
		if (this.rafHandle !== null) return;
		this.rafHandle = requestAnimationFrame(() => {
			this.rafHandle = null;
			if (this.activeQueryClient && !this.isDestroyed) {
				this.drain(this.activeQueryClient);
			}
		});
	}

	private drain(queryClient: QueryClient): void {
		if (this.pending.size === 0) return;

		const byRoom = new Map<string, Map<string, string>>();
		for (const [turnId, { roomId, text }] of this.pending) {
			const room = byRoom.get(roomId) ?? new Map<string, string>();
			room.set(turnId, text);
			byRoom.set(roomId, room);
		}
		this.pending.clear();

		for (const [roomId, turnTexts] of byRoom) {
			patchDeliberation(queryClient, roomId, (room) => ({
				...room,
				turns: room.turns.map((turn) => {
					const bufferedText = turnTexts.get(turn.id);
					if (bufferedText === undefined) return turn;

					return {
						...turn,
						content: turn.content + bufferedText,
						status: turn.status === "pending" ? "streaming" : turn.status,
					};
				}),
			}));
		}
	}
}

let globalBufferManager: TokenBufferManager | null = null;

export function getTokenBufferManager(): TokenBufferManager {
	if (!globalBufferManager) {
		globalBufferManager = new TokenBufferManager();
	}
	return globalBufferManager;
}

export function destroyTokenBufferManager(): void {
	globalBufferManager?.destroy();
	globalBufferManager = null;
}

export function bufferToken(
	queryClient: QueryClient,
	roomId: string,
	turnId: string,
	token: string,
): void {
	getTokenBufferManager().buffer(queryClient, roomId, turnId, token);
}
