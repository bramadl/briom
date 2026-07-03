import type { Participant } from "../../participant/participant";
import type { Room } from "../../room";
import type { Turn } from "../turn";

/**
 * @description
 * Everything needed to evaluate which participants might speak next.
 */
export interface ProposalContext {
	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	participants: Participant[];

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	room: Room;

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	turns: Turn[];
}
