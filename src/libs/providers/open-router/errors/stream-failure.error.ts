import { InfraError } from "@briom/libs/drimion";

export class StreamFailureError extends InfraError {
	public constructor() {
		super("Failed to stream the model response.", { context: "OpenRouter" });
	}
}
