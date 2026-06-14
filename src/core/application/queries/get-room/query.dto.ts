export type ParticipantDTO = {
	id: string;
	displayName: string;
	provider: string;
	model: string;
};

export type TurnDTO = {
	id: string;
	sequenceNumber: number;
	role: "user" | "participant";
	participantId: string | null;
	intent: string | null;
	content: string;
	createdAt: string;
};

export type RoomDTO = {
	id: string;
	title: string;
	createdAt: string;
	participants: ParticipantDTO[];
	turns: TurnDTO[];
};
