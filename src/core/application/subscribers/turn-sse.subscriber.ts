import type {
	TurnFailed,
	TurnSettled,
	TurnStreamStarted,
	TurnTokenAccumulated,
} from "@briom/domain/turn";

import type { ISseForwarder } from "../services/ports/sse-forwarder";

export class TurnSseSubscriber {
	public constructor(private readonly sse: ISseForwarder) {}

	public onTurnStreamStarted(event: TurnStreamStarted): void {
		// Optional: notify client that stream actually started
		// (thinking → streaming transition)
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:token",
			data: {
				turnId: event.payload.turnId.value(),
			},
		});
	}

	public onTurnTokenAccumulated(event: TurnTokenAccumulated): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:token",
			data: {
				turnId: event.payload.turnId.value(),
				token: event.payload.token,
			},
		});
	}

	public onTurnSettled(event: TurnSettled): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:settled",
			data: {
				turnId: event.payload.turnId.value(),
				content: event.payload.content,
			},
		});
	}

	public onTurnFailed(event: TurnFailed): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "turn:failed",
			data: {
				turnId: event.payload.turnId.value(),
				error: event.payload.error,
			},
		});
	}
}
