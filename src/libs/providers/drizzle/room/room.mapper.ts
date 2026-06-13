import { Room, RoomId } from "@briom/domain/room";
import type { RoomRecord } from "@briom/drizzle/schema";

export const RoomMapper = {
	toDomain(record: RoomRecord): Room {
		const result = Room.create({
			id: RoomId(record.id),
			title: record.title,
			createdAt: record.createdAt,
		});

		if (result.isError()) throw result.error();
		return result.value();
	},

	toPersistence(room: Room): RoomRecord {
		return {
			id: room.id.value(),
			title: room.get("title"),
			createdAt: room.get("createdAt"),
		};
	},
};
