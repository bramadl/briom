export type InviteParticipantInput = {
	roomId: string;
	provider: string;
	model: string;
	displayName: string;
};

export type InviteParticipantOutput = {
	participantId: string;
};

export class InviteParticipantCommand {
	constructor(public readonly input: InviteParticipantInput) {}
}
