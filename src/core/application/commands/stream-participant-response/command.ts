import type { RoomNotFoundError } from "@briom/domain/room";
import type { Intent } from "@briom/domain/turn";
import type { DomainError } from "@briom/drimion";

export type StreamParticipantResponseInput = {
	roomId: string;
	targetParticipantId: string;
	intent: Intent;
};

export type StreamParticipantResponseErrors = RoomNotFoundError | DomainError;
export type StreamParticipantResponseOutput = {
	stream: ReadableStream<string>;
	persist: (content: string) => Promise<string>;
};

export class StreamParticipantResponseCommand {
	constructor(public readonly input: StreamParticipantResponseInput) {}
}
