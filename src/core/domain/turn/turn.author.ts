import { ValueObject } from "@briom/drimion";

import type { ModeratorId, ParticipantId } from "../room";

interface TurnAuthorProps {
	moderatorId?: ModeratorId;
	participantId?: ParticipantId;
	type: "moderator" | "participant";
}

/**
 * @description
 * `TurnAuthor` — Value Object
 *
 * Represents who contributed a turn: either the human moderator or an AI participant.
 * Encapsulates the author type and their respective ID, ensuring that a turn always
 * has exactly one valid author identity.
 *
 * **Why a Value Object?**
 * The combination of type + ID fully defines authorship. There is no lifecycle
 * beyond these two properties, and equality is by value.
 */
export class TurnAuthor extends ValueObject<TurnAuthorProps> {
	private constructor(props: TurnAuthorProps) {
		super(props);
	}

	/**
	 * @description
	 * Creates an author representing the human moderator.
	 */
	public static asModerator(moderatorId: ModeratorId): TurnAuthor {
		return new TurnAuthor({ type: "moderator", moderatorId });
	}

	/**
	 * @description
	 * Creates an author representing an AI participant.
	 */
	public static asParticipant(participantId: ParticipantId): TurnAuthor {
		return new TurnAuthor({ type: "participant", participantId });
	}

	/**
	 * @description
	 * Whether this author is the human moderator.
	 */
	public get isModerator(): boolean {
		return this.get("type") === "moderator";
	}

	/**
	 * @description
	 * Whether this author is an AI participant.
	 */
	public get isParticipant(): boolean {
		return this.get("type") === "participant";
	}

	/**
	 * @description
	 * The moderator ID if `isModerator`, null otherwise.
	 */
	public get moderatorId(): ModeratorId | null {
		return this.isModerator ? (this.get("moderatorId") as ModeratorId) : null;
	}

	/**
	 * @description
	 * The participant ID if `isParticipant`, null otherwise.
	 */
	public get participantId(): ParticipantId | null {
		return this.isParticipant
			? (this.get("participantId") as ParticipantId)
			: null;
	}
}
