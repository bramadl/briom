export interface RetryTurnInput {
	turnId: string;
}

export interface RetryTurnOutput {
	newTurnId: string;
}

export class RetryTurnCommand {
	constructor(public readonly input: RetryTurnInput) {}
}
