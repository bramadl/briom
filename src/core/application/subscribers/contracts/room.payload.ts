interface RoomBasePayload {
	roomId: string;
}

export interface RoomDeliberationConcludedPayload extends RoomBasePayload {}

export interface RoomDeliberationPausedPayload extends RoomBasePayload {}

export interface RoomDeliberationResumedPayload extends RoomBasePayload {}

export interface RoomDeliberationStartedPayload extends RoomBasePayload {
	topic: string;
}

export interface RoomFormedPayload extends RoomBasePayload {}

export interface RoomParticipantJoinedPayload extends RoomBasePayload {
	participantId: string;
}

export interface RoomTurnRegisteredPayload extends RoomBasePayload {
	turnId: string;
}
