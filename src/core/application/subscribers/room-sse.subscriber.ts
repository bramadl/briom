import type {
	DeliberationConcluded,
	DeliberationPaused,
	DeliberationResumed,
	DeliberationStarted,
	ParticipantInvited,
	RoomFormed,
	TurnRegistered,
} from "@briom/domain";

import type { ISseForwarder } from "../services/ports/sse-forwarder";

export class RoomSseSubscriber {
	public constructor(private readonly sse: ISseForwarder) {}

	public onRoomFormed(event: RoomFormed): void {
		// Optional: notify creator that room is ready
		// Usually not needed karena sync response
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:participant-joined",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}

	public onParticipantInvited(event: ParticipantInvited): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:participant-joined",
			data: {
				roomId: event.payload.roomId.value(),
				participantId: event.payload.participantId.value(),
			},
		});
	}

	public onDeliberationStarted(event: DeliberationStarted): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-started",
			data: {
				roomId: event.payload.roomId.value(),
				topic: event.payload.topic,
			},
		});
	}

	public onTurnRegistered(event: TurnRegistered): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:turn-registered",
			data: {
				roomId: event.payload.roomId.value(),
				turnId: event.payload.turnId.value(),
			},
		});
	}

	public onDeliberationPaused(event: DeliberationPaused): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-paused",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}

	public onDeliberationResumed(event: DeliberationResumed): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-resumed",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}

	public onDeliberationConcluded(event: DeliberationConcluded): void {
		this.sse.broadcastToRoom(event.payload.roomId.value(), {
			event: "room:deliberation-concluded",
			data: {
				roomId: event.payload.roomId.value(),
			},
		});
	}
}
