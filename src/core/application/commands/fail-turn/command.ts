export interface FailTurnInput {
	kind:
		| "timeout"
		| "rate_limited"
		| "model_not_found"
		| "stream_failure"
		| "aborted"
		| "empty_response";
	message?: string;
	retryAfter?: number;
	turnId: string;
}

export class FailTurnCommand {
	constructor(public readonly input: FailTurnInput) {}
}
