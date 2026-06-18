import type { IntentOption, TurnStatusOption } from "@briom/core/domain";
import type { STREAM_ERROR } from "@briom/core/domain/turn";

export interface TurnDTO {
	author: {
		moderatorId?: string;
		participantId?: string;
		type: "moderator" | "participant";
	};
	createdAt: string;
	error: {
		kind: (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR];
		message: string;
		occurredAt: string;
		retryAfter?: number;
	} | null;
	failedAt: string | null;
	id: string;
	intent: IntentOption | null;
	perspective: {
		content: string;
		renderedAt: string | null;
	};
	previousTurnId: string | null;
	roomId: string;
	sequence: number;
	settledAt: string | null;
	status: TurnStatusOption;
	tokens: string[];
}

export interface GetTurnsInput {
	roomId: string;
}

export interface GetTurnsOutput {
	turns: TurnDTO[];
}

export interface GetTurnsQuery {
	execute(input: GetTurnsInput): Promise<GetTurnsOutput>;
}
