import type { IntentOption, STREAM_ERROR } from "@briom/domain";

interface TurnBasePayload {
	turnId: string;
}

export interface TurnFailedPayload extends TurnBasePayload {
	error: {
		kind: (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR];
		message: string;
		occurredAt: string;
		retryAfter?: number;
	};
}

export interface TurnInitiatedPayload extends TurnBasePayload {
	authorType: "moderator" | "participant";
	clientTurnId: string | null;
	intent: IntentOption | null;
	moderatorId: string | null;
	participantId: string | null;
	roomId: string;
	sequence: number;
}

export interface TurnSettledPayload extends TurnBasePayload {
	content: string;
}

export interface TurnStreamStartedPayload extends TurnBasePayload {}

export interface TurnTokenPayload extends TurnBasePayload {
	token?: string;
}
