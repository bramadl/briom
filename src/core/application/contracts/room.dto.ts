import type { ParticipantDTO } from "./participant.dto";
import type { ParticipantTurnDTO } from "./turn.dto";

export interface RoomOverviewDTO extends RoomDTO {
	/**
	 * @description
	 * The last (maxed at 3) turns generated in the room.
	 *
	 * This will only appear when the turns within the room
	 * exceeds a certain threshold.
	 */
	lastTurnOverview: [
		ParticipantTurnDTO,
		ParticipantTurnDTO?,
		ParticipantTurnDTO?,
	];
	/**
	 * @description
	 * The last conclusion a chosen participant generated.
	 */
	summary: {
		/**
		 * @description
		 * The participant made this summary.
		 */
		author: ParticipantDTO;
		/**
		 * @description
		 * The markdown content of the summary.
		 */
		content: string;
		/**
		 * @description
		 * The date when this summary is generated successfully.
		 */
		generatedAt: Date;
	};
}

export interface RoomDTO {
	/**
	 * @description
	 * An UUID assigned to the room on first forming.
	 */
	id: string;
	/**
	 * @description
	 * List of participants in this room.
	 */
	participants: ParticipantDTO[];
	/**
	 * @description
	 * The title of the room set by moderator–this is mutable.
	 */
	title: string;
	/**
	 * @description
	 * The immutable topic set by the moderator when deliberating the room.
	 *
	 * Once set, this cannot be changed.
	 */
	topic: string | null;
}
