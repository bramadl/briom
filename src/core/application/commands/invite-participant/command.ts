export interface InviteParticipantInput {
	displayName: string;
	model: string;
	provider: string;
	roomId: string;
}

export interface InviteParticipantOutput {
	participantId: string;
}

export class InviteParticipantCommand {
	constructor(public readonly input: InviteParticipantInput) {}
}
