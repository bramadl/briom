import { ValueObject } from "@drimion";

import type { ModeratorId } from "../../moderator/moderator.id";
import type { ParticipantId } from "../participant/participant.id";

import { InvalidAuthorError } from "./errors/invalid-author.error";

type ModeratorAuthorProps = { from: "moderator"; id: ModeratorId };
type ParticipantAuthorProps = { from: "participant"; id: ParticipantId };

/**
 * @description
 * Who contributed a turn — the human moderator or an AI participant
 */
export type TurnAuthorProps = ModeratorAuthorProps | ParticipantAuthorProps;

/**
 * @description
 * Who contributed a turn — the human moderator or an AI participant.
 * Fully defined by its properties; no lifecycle beyond the turn it belongs to.
 */
export class TurnAuthor extends ValueObject<TurnAuthorProps> {
	private constructor(props: TurnAuthorProps) {
		super(props);
	}

	public static override isValidProps(
		props: TurnAuthorProps,
	): InvalidAuthorError | undefined {
		const { from } = props;
		if (from !== "moderator" && from !== "participant") {
			return new InvalidAuthorError(`Unknown author type: ${from}`);
		}
	}

	/**
	 * @description
	 * Creates an author representing the human moderator.
	 */
	public static fromModerator(id: ModeratorId): TurnAuthor {
		return new TurnAuthor({ from: "moderator", id });
	}

	/**
	 * @description
	 * Creates an author representing an AI participant.
	 */
	public static fromParticipant(id: ParticipantId): TurnAuthor {
		return new TurnAuthor({ from: "participant", id });
	}

	/**
	 * @description
	 * Whether this author is the human moderator, or an AI participant.
	 */
	public get from(): "moderator" | "participant" {
		return this.get("from");
	}

	/**
	 * @description
	 * The underlying ModeratorId or ParticipantId, depending on `from`.
	 */
	public get id(): ModeratorId | ParticipantId {
		return this.get("id");
	}

	/**
	 * @description
	 * Whether this author is the human moderator.
	 */
	public get isModerator(): boolean {
		return this.get("from") === "moderator";
	}

	/**
	 * @description
	 * Whether this author is an AI participant.
	 */
	public get isParticipant(): boolean {
		return this.get("from") === "participant";
	}

	/**
	 * @description
	 * The ModeratorId if authored by moderator, null otherwise.
	 * Prefer checking isModerator first for type-safe narrowing.
	 */
	public get moderatorId(): ModeratorId | null {
		return this.isModerator ? (this.id as ModeratorId) : null;
	}

	/**
	 * @description
	 * The ParticipantId if authored by participant, null otherwise.
	 * Prefer checking isParticipant first for type-safe narrowing.
	 */
	public get participantId(): ParticipantId | null {
		return this.isParticipant ? (this.id as ParticipantId) : null;
	}
}
