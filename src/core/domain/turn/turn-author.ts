import type { ParticipantId } from "../participant";

export type TurnAuthorAsUser = { readonly type: "user" };
export type TurnAuthorAsParticipant = {
	readonly type: "participant";
	readonly participantId: ParticipantId;
};

export type TurnAuthor = TurnAuthorAsUser | TurnAuthorAsParticipant;
