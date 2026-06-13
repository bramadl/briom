import type { Intent, RoomNotFoundError, Turn } from "@briom/domain";
import type { DomainError } from "@briom/drimion";

export type RequestParticipantResponseInput = {
	roomId: string;
	targetParticipantId: string;
	intent: Intent;
};

export type RequestParticipantResponseErrors = RoomNotFoundError | DomainError;
export type RequestParticipantResponseOutput = Turn;

export class RequestParticipantResponseCommand {
	constructor(public readonly input: RequestParticipantResponseInput) {}
}
