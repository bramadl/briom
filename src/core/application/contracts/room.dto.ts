import type { RoomStatusOption, SynthesisProcess } from "@briom/domain";

import type { ParticipantDTO } from "./participant.dto";

/**
 * @description
 * `RoomDTO` — Data Transfer Object.
 *
 * Flat, serializable representation of a `Room` aggregate for read operations.
 * Contains all data needed to render a room in the UI without loading
 * the full aggregate graph.
 *
 * **Why a DTO?**
 * The `Room` aggregate contains entities (Participants) and value objects that
 * are not directly serializable. The DTO collapses these into primitive types
 * suitable for JSON, caching, and API responses.
 *
 * **Identity Preservation**
 * IDs remain as strings (not objects) for transport, but retain their
 * domain meaning through naming (roomId, participantIds, turnIds).
 */
export interface RoomDTO {
	/**
	 * @description
	 * ISO 8601 timestamp of room creation.
	 */
	createdAt: string;

	/**
	 * @description
	 * Unique room identifier.
	 */
	id: string;

	/**
	 * @description
	 * Moderator (human user) who guides this deliberation.
	 */
	moderatorId: string;

	/**
	 * @description
	 * The invited AI participants. Empty during `FORMING` status.
	 */
	participants: ParticipantDTO[];

	/**
	 * @description
	 * Current lifecycle status of the room.
	 */
	status: RoomStatusOption;

	/**
	 * @description
	 * Synthesis content of a concluded room.
	 */
	synthesis: string | null;

	/**
	 * @description
	 * ISO 8601 timestamp of synthesis creation.
	 */
	synthesisCreatedAt: string | null;

	/**
	 * @description
	 * Participant (or model) name that generates the synthesis.
	 */
	synthesisCreatedBy: string | null;

	/**
	 * @description
	 * Current status of the synthesis process.
	 */
	synthesisStatus: SynthesisProcess;

	/**
	 * @description
	 * Human-readable room title.
	 */
	title: string;

	/**
	 * @description
	 * Deliberation topic (null until deliberation starts).
	 */
	topic: string | null;

	/**
	 * @description
	 * IDs of turns in this room, ordered by sequence.
	 */
	turnIds: string[];
}
