export interface SettleTurnInput {
	content: string;
	turnId: string;
}

export class SettleTurnCommand {
	constructor(public readonly input: SettleTurnInput) {}
}
