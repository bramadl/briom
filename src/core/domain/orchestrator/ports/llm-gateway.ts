import type { QualifiedModel } from "@briom/domain/ai";
import type { InfraError, IResult } from "@briom/libs/drimion";

import type { Message } from "../transcriptor/message";

export interface GenerateInput {
	messages: Message[];
	qualifiedModel: QualifiedModel;
	systemPrompt: string;
}

export interface LlmGateway {
	stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, InfraError>>;
}
