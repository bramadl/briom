import type {
	CompleteOutput,
	GenerateInput,
	ILLMGateway,
	StreamOutput,
} from "@briom/core/app";
import type { StreamError } from "@briom/core/domain";
import type { OpenRouterClient } from "@briom/openrouter/client";
import type { IResult } from "@drimion";

export class OpenRouterLLMGateway implements ILLMGateway {
	public constructor(private readonly client: OpenRouterClient) {}

	public async complete(
		input: GenerateInput,
	): Promise<IResult<CompleteOutput, StreamError>> {
		throw new Error("Method not implemented.");
	}

	public async stream(
		input: GenerateInput,
	): Promise<IResult<StreamOutput, StreamError>> {
		throw new Error("Method not implemented.");
	}
}
