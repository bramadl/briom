import type { Room, RoomId, RoomRepository } from "@briom/domain";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { eq } from "drizzle-orm";

import { ParticipantMapper, RoomMapper } from "./room.mapper";

export class DrizzleRoomRepository implements RoomRepository {
	constructor(private readonly db: Database) {}

	async findById(id: RoomId): Promise<Room | null> {
		const record = await this.db.query.roomsTable.findFirst({
			where: eq(roomsTable.id, id.value()),
		});

		if (!record) return null;

		const [participantRecords, turnRecords] = await Promise.all([
			this.db
				.select()
				.from(participantsTable)
				.where(eq(participantsTable.roomId, id.value())),
			this.db
				.select({ id: turnsTable.id })
				.from(turnsTable)
				.where(eq(turnsTable.roomId, id.value()))
				.orderBy(turnsTable.sequence),
		]);

		return RoomMapper.toDomain(
			record,
			participantRecords,
			turnRecords.map((t) => t.id),
		);
	}

	async persist(room: Room): Promise<void> {
		const record = RoomMapper.toPersistence(room);
		await this.db
			.insert(roomsTable)
			.values(record)
			.onConflictDoUpdate({
				target: roomsTable.id,
				set: {
					title: record.title,
					status: record.status,
					topic: record.topic,
				},
			});

		const participants = room.get("participants");
		for (const participant of participants) {
			const pRecord = ParticipantMapper.toPersistence(participant);
			await this.db
				.insert(participantsTable)
				.values(pRecord)
				.onConflictDoUpdate({
					target: participantsTable.id,
					set: {
						displayName: pRecord.displayName,
					},
				});
		}
	}

	async close(room: Room): Promise<void> {
		await this.db.delete(roomsTable).where(eq(roomsTable.id, room.id.value()));
	}
}
