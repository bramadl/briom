import type { IResult } from "@briom/libs/drimion";

import type { Message, StreamError } from "../turn";

export interface GenerateInput {
	messages: Message[];
	qualifiedModel: string;
	systemPrompt: string;
}

export interface LlmGateway {
	stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, StreamError>>;
}
