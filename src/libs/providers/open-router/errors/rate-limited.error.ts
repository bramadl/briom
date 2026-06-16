import { InfraError } from "@briom/libs/drimion";

export class RateLimitedError extends InfraError {
	public constructor(
		public readonly model: string,
		public readonly retryAfter?: number,
	) {
		const baseMsg = `${model} is currently busy`;
		const message = retryAfter
			? `${baseMsg}, retry after ${retryAfter} seconds.`
			: baseMsg;

		super(message, { context: "OpenRouter" });
	}
}
