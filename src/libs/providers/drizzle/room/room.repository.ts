import type { Room, RoomId, RoomRepository } from "@briom/domain/room";
import type { Database } from "@briom/drizzle/client";
import { roomsTable } from "@briom/drizzle/schema";
import { eq } from "drizzle-orm";

import { RoomMapper } from "./room.mapper";

export class DrizzleRoomRepository implements RoomRepository {
	constructor(private readonly db: Database) {}

	async findById(id: RoomId): Promise<Room | null> {
		const record = await this.db.query.roomsTable.findFirst({
			where: eq(roomsTable.id, id as string),
		});

		return record ? RoomMapper.toDomain(record) : null;
	}

	async save(room: Room): Promise<void> {
		const record = RoomMapper.toPersistence(room);
		await this.db
			.insert(roomsTable)
			.values(record)
			.onConflictDoUpdate({
				target: roomsTable.id,
				set: { title: record.title },
			});
	}

	async delete(room: Room): Promise<void> {
		await this.db.delete(roomsTable).where(eq(roomsTable.id, room.id.value()));
	}

	// async archive(room: Room): Promise<void> {
	// 	await this.db
	// 		.update(roomsTable)
	// 		.set({ deletedAt: new Date() })
	// 		.where(eq(roomsTable.id, room.id.value()));
	// }
}
