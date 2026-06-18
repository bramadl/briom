export interface InitiateParticipantTurnInput {
	intent: string;
	participantId: string;
	roomId: string;
}

export interface InitiateParticipantTurnOutput {
	turnId: string;
}

export class InitiateParticipantTurnCommand {
	constructor(public readonly input: InitiateParticipantTurnInput) {}
}
