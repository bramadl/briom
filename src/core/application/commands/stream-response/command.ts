import type { Intent } from "@briom/domain/turn";

export type StreamResponseInput = {
	roomId: string;
	targetParticipantId: string;
	intent: Intent;
};

export type StreamResponseOutput = {
	stream: ReadableStream<string>;
	turnId: string;
	persist: (content: string) => Promise<string>;
	markFailed: () => Promise<void>;
};

export class StreamResponseCommand {
	constructor(public readonly input: StreamResponseInput) {}
}
