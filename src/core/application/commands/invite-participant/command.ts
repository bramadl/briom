import type { RoomNotFoundError } from "@briom/domain";
import type { DomainError } from "@briom/drimion";

export type InviteParticipantInput = {
	roomId: string;
	provider: string;
	model: string;
	displayName: string;
};

export type InviteParticipantErrors = RoomNotFoundError | DomainError;
export type InviteParticipantOutput = {
	participantId: string;
};

export class InviteParticipantCommand {
	constructor(public readonly input: InviteParticipantInput) {}
}
