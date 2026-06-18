export interface AbandonTurnInput {
	turnId: string;
}

export class AbandonTurnCommand {
	constructor(public readonly input: AbandonTurnInput) {}
}
