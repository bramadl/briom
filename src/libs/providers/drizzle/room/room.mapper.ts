import type { SynthesisProcess } from "@briom/domain";
import {
	ModeratorId,
	ParticipantId,
	Room,
	RoomId,
	type RoomStatusOption,
	TurnId,
} from "@briom/domain";
import {
	Participant,
	ParticipantModel,
	ParticipantModelAi,
	ParticipantModelProvider,
} from "@briom/domain/room/participant";
import type { RoomRecord } from "@briom/drizzle/schema";
import type { ParticipantRecord } from "./room.model";

/**
 * @description
 * `ParticipantMapper` — Infrastructure Mapper
 *
 * Translates between `Participant` domain entities and database records.
 * Handles the decomposition of `ParticipantModel` (Value Object) into
 * separate provider/model columns for storage.
 *
 * **Mapping Rules**
 * - Domain: `ParticipantModel` = { model: ParticipantModelAi, provider: ParticipantModelProvider }
 * - DB: separate `model` and `provider` text columns
 * - Domain ID (ParticipantId) ↔ DB `id` string
 */
export const ParticipantMapper = {
	/**
	 * @description
	 * Reconstitutes a `Participant` entity from database record.
	 *
	 * @param record - Raw participant row from database
	 * @returns Fully constructed `Participant` entity
	 */
	toDomain(record: ParticipantRecord): Participant {
		return Participant.rehydrate({
			id: ParticipantId(record.id),
			roomId: RoomId(record.roomId),
			displayName: record.displayName,
			model: ParticipantModel.rehydrate({
				model: ParticipantModelAi(record.model),
				provider: ParticipantModelProvider(record.provider),
			}),
		});
	},

	/**
	 * @description
	 * Flattens a `Participant` entity into database record shape.
	 *
	 * @param participant - Domain entity to persist
	 * @returns Record suitable for `INSERT`/`UPDATE`
	 */
	toPersistence(participant: Participant): ParticipantRecord {
		return {
			id: participant.id.value(),
			roomId: participant.get("roomId").value(),
			displayName: participant.get("displayName"),
			model: participant.get("model").model as string,
			provider: participant.get("model").provider as string,
		};
	},
};

/**
 * @description
 * `RoomMapper` — Infrastructure Mapper
 *
 * Translates between Room aggregate and database records.
 * Handles the complex reconstitution of Room with its Participants and Turn IDs.
 *
 * **Note on Turn IDs**
 * Turns are stored in a separate table. The mapper receives turn IDs
 * as a separate array (queried by the repository) rather than joining
 * them directly — this keeps the mapper pure and the repository in control
 * of query strategy.
 */
export const RoomMapper = {
	/**
	 * @description
	 * Reconstitutes a Room aggregate from database records.
	 *
	 * @param record - Raw room row from database
	 * @param participantRecords - Associated participants (default empty)
	 * @param turnIds - IDs of turns in this room (default empty)
	 * @returns Fully constructed `Room` aggregate with all entities
	 */
	toDomain(
		record: RoomRecord,
		participantRecords: ParticipantRecord[] = [],
		turnIds: string[] = [],
	): Room {
		return Room.rehydrate({
			id: RoomId(record.id),
			title: record.title,
			moderatorId: ModeratorId(record.moderatorId),
			status: record.status as RoomStatusOption,
			topic: record.topic,
			participants: participantRecords.map(ParticipantMapper.toDomain),
			turnIds: turnIds.map((id) => TurnId(id)),
			createdAt: record.createdAt,
			synthesis: record.synthesis,
			synthesisStatus: record.synthesisStatus as SynthesisProcess,
			synthesisCreatedAt: record.synthesisCreatedAt,
			synthesisCreatedBy: record.synthesisCreatedBy,
			attachmentCount: record.attachmentCount,
		});
	},

	/**
	 * @description
	 * Flattens a `Room` aggregate into database record shape.
	 *
	 * **Note**: Does NOT include participants or turn IDs — those are
	 * persisted separately by the repository (cascade or explicit).
	 *
	 * @param room - Domain aggregate to persist
	 * @returns Record suitable for `INSERT`/`UPDATE`
	 */
	toPersistence(room: Room): RoomRecord {
		return {
			id: room.id.value(),
			title: room.get("title"),
			moderatorId: room.get("moderatorId").value(),
			status: room.get("status"),
			topic: room.get("topic"),
			createdAt: room.get("createdAt"),
			synthesis: room.get("synthesis"),
			synthesisStatus: room.get("synthesisStatus"),
			synthesisCreatedAt: room.get("synthesisCreatedAt"),
			synthesisCreatedBy: room.get("synthesisCreatedBy"),
			attachmentCount: room.get("attachmentCount"),
		};
	},
};
