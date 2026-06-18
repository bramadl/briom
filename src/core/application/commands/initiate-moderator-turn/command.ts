export interface InitiateModeratorTurnInput {
	content: string;
	moderatorId: string;
	roomId: string;
}

export interface InitiateModeratorTurnOutput {
	turnId: string;
}

export class InitiateModeratorTurnCommand {
	constructor(public readonly input: InitiateModeratorTurnInput) {}
}
