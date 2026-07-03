import type { RoomStatus } from "@briom/core/domain";

import type { RoomAttachmentDTO } from "./room-attachment.dto";
import type { RoomParticipantDTO } from "./room-participant.dto";
import type { RoomTurnDTO } from "./room-turn.dto";

/**
 * @description
 * `RoomDTO` — Full deliberation view for the room page.
 *
 * A single denormalized payload. All data needed to render the
 * deliberation page — participants, turns (with embedded author
 * display info), synthesis, and room metadata — is returned.
 */
export interface RoomDTO {
	/**
	 * @description
	 * Full room UUID.
	 */
	id: string;

	/**
	 * @description
	 * Read-only room information.
	 */
	info: {
		/**
		 * @description
		 * Deliberation topic. Null until deliberation starts.
		 */
		topic: string | null;

		/**
		 * @description
		 * Invited AI participants.
		 * Ordered by invite sequence.
		 */
		participants: RoomParticipantDTO[];

		/**
		 * @description
		 * All turns in the room, ordered by sequence ascending.
		 *
		 * Author display info is embedded per turn — FE never
		 * needs to look up `participants` by ID to render.
		 */
		turns: RoomTurnDTO[];

		/**
		 * @description
		 * All attachments ever attached into this room.
		 * Empty if Moderator never attached any attachments ever.
		 */
		attachments: RoomAttachmentDTO[];

		/**
		 * @description
		 * Read-only room metadata.
		 */
		metadata: {
			/**
			 * @description
			 * Current lifecycle status.
			 */
			status: RoomStatus;

			/**
			 * @description
			 * First 8 characters of the room UUID for display
			 *
			 * @example "#a1b2c3d4".
			 */
			shortId: string;

			/**
			 * @description
			 * ISO 8601 timestamp of room formation.
			 */
			formedAt: string;

			/**
			 * @description
			 * Moderator (human user) identifier.
			 */
			moderatorId: string;
		};
	};

	/**
	 * @description
	 * Human-readable room title.
	 */
	title: string;
}
