export interface AccumulateTokenInput {
	token: string;
	turnId: string;
}

export class AccumulateTokenCommand {
	constructor(public readonly input: AccumulateTokenInput) {}
}
