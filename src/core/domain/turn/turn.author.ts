import { ValueObject } from "@briom/drimion";

import type { ModeratorId, ParticipantId } from "../room";

interface TurnAuthorProps {
	moderatorId?: ModeratorId;
	participantId?: ParticipantId;
	type: "moderator" | "participant";
}

export class TurnAuthor extends ValueObject<TurnAuthorProps> {
	private constructor(props: TurnAuthorProps) {
		super(props);
	}

	public static asModerator(moderatorId: ModeratorId): TurnAuthor {
		return new TurnAuthor({ type: "moderator", moderatorId });
	}

	public static asParticipant(participantId: ParticipantId): TurnAuthor {
		return new TurnAuthor({ type: "participant", participantId });
	}

	public get isModerator(): boolean {
		return this.get("type") === "moderator";
	}

	public get isParticipant(): boolean {
		return this.get("type") === "participant";
	}

	public get moderatorId(): ModeratorId | null {
		return this.isModerator ? (this.get("moderatorId") as ModeratorId) : null;
	}

	public get participantId(): ParticipantId | null {
		return this.isParticipant
			? (this.get("participantId") as ParticipantId)
			: null;
	}
}
