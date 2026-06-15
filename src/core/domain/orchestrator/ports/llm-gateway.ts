import type { QualifiedModel } from "@briom/domain/ai";

import type { Message } from "../transcriptor/message";

export interface GenerateInput {
	messages: Message[];
	qualifiedModel: QualifiedModel;
	systemPrompt: string;
}

export interface Generation {
	content: string;
}

export interface LlmGateway {
	stream(input: GenerateInput): Promise<ReadableStream<string>>;
}
