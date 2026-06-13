import type {
	Participant,
	ParticipantRepository,
} from "@briom/domain/participant";
import type { RoomId } from "@briom/domain/room";
import type { Database } from "@briom/drizzle/client";
import { participantsTable } from "@briom/drizzle/schema";
import { eq } from "drizzle-orm";

import { ParticipantMapper } from "./participant.mapper";

export class DrizzleParticipantRepository implements ParticipantRepository {
	constructor(private readonly db: Database) {}

	async findByRoom(roomId: RoomId): Promise<Participant[]> {
		const records = await this.db.query.participantsTable.findMany({
			where: eq(participantsTable.roomId, roomId as string),
		});

		return records.map(ParticipantMapper.toDomain);
	}

	async save(participant: Participant): Promise<void> {
		const record = ParticipantMapper.toPersistence(participant);
		await this.db
			.insert(participantsTable)
			.values(record)
			.onConflictDoUpdate({
				target: participantsTable.id,
				set: {
					displayName: record.displayName,
					model: record.model,
				},
			});
	}
}
