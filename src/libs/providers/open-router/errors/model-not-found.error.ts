import { InfraError } from "@briom/libs/drimion";

export class ModelNotFoundError extends InfraError {
	public constructor(model: string) {
		super(`Seems like ${model} cannot be found.`, { context: "OpenRouter" });
	}
}
