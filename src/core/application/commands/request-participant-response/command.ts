import type { RoomNotFoundError } from "@briom/domain/room";
import type { Intent, Turn } from "@briom/domain/turn";
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
