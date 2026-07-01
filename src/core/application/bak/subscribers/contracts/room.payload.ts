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
	model: string;
	name: string;
	participantId: string;
	provider: string;
	qualifiedModel: string;
}

export interface RoomTurnRegisteredPayload extends RoomBasePayload {
	turnId: string;
}
