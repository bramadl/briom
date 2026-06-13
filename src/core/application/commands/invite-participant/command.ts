import type { AiProvider } from "@briom/domain/ai";
import type { Participant } from "@briom/domain/participant";
import type { RoomNotFoundError } from "@briom/domain/room";
import type { DomainError } from "@briom/drimion";

export type InviteParticipantInput = {
	roomId: string;
	provider: AiProvider;
	model: string;
	displayName: string;
};

export type InviteParticipantErrors = RoomNotFoundError | DomainError;
export type InviteParticipantOutput = Participant;

export class InviteParticipantCommand {
	constructor(public readonly input: InviteParticipantInput) {}
}
