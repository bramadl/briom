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

export const ParticipantMapper = {
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

export const RoomMapper = {
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
		});
	},

	toPersistence(room: Room): RoomRecord {
		return {
			id: room.id.value(),
			title: room.get("title"),
			moderatorId: room.get("moderatorId").value(),
			status: room.get("status"),
			topic: room.get("topic"),
			createdAt: room.get("createdAt"),
		};
	},
};
