import type { RoomStatusOption } from "@briom/core/domain";

import type { ParticipantBubbleDTO, ParticipantDTO } from "./participant.dto";
import type { ParticipantTurnDTO, TurnDTO } from "./turn.dto";

interface BaseRoomDTO {
	/**
	 * @description
	 * An UUID assigned to the room on first forming.
	 */
	id: string;
	/**
	 * @description
	 * Current state of the room's status lifecycle.
	 */
	status: RoomStatusOption;
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

export interface RoomDTO extends BaseRoomDTO {
	/**
	 * @description
	 * List of participants in this room.
	 */
	participants: ParticipantDTO[];
	/**
	 * @description
	 * List of all settled turns in this room.
	 */
	turns: TurnDTO[];
}

export interface RoomOverviewDTO extends BaseRoomDTO {
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
	 * List of participants in this room.
	 */
	participants: ParticipantBubbleDTO[];
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
