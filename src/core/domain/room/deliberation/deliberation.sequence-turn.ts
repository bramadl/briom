import type { ParticipantId } from "../participant/participant.id";
import type { TurnIntent } from "../turn/turn.intent";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface NextSequenceTurnInput {
	/**
	 * @description
	 * Participant IDs explicitly @mentioned by the moderator in this turn's
	 * content. The first entry, if any, takes priority over round-robin
	 * selection.
	 */
	mentionedParticipantIds: ParticipantId[];

	/**
	 * @description
	 * Whether this Room has more than one Participant. Determines whether
	 * round-robin selection applies when no explicit mention is given.
	 */
	multiDeliberation: boolean;
}

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface NextSequenceTurnOutput {
	/**
	 * @description
	 * The intent the next participant turn should carry, derived from how
	 * the responder was selected — DIRECT for an explicit mention, RESPOND
	 * otherwise.
	 */
	intent: TurnIntent;

	/**
	 * @description
	 * The Participant selected to speak next.
	 */
	nextResponderId: ParticipantId;
}
