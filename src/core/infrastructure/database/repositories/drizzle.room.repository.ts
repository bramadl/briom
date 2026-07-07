import {
	CheckpointId,
	type IRoomRepository,
	type Moderator,
	ModeratorId,
	Participant,
	ParticipantId,
	ParticipantModel,
	Room,
	RoomId,
	RoomState,
	TurnId,
} from "@briom/core/domain";
import type { DrizzleConn } from "@briom/drizzle/db";
import { participantsTable, roomsTable } from "@briom/drizzle/schema";
import { eq, sql } from "drizzle-orm";

import { DrizzleBaseRepository } from "./drizzle.base.repository";

export class DrizzleRoomRepository
	extends DrizzleBaseRepository
	implements IRoomRepository
{
	public constructor(private db: DrizzleConn) {
		super();
	}

	public async close(room: Room): Promise<void> {
		await this.db.delete(roomsTable).where(eq(roomsTable.id, room.id.value()));
	}

	public async countFor(moderator: Moderator): Promise<number> {
		const count = await this.db.$count(
			roomsTable,
			eq(roomsTable.moderatorId, moderator.id.value()),
		);

		return count;
	}

	public async findById(id: RoomId): Promise<Room | null> {
		const room = await this.db.query.roomsTable.findFirst({
			where: { id: id.value() },
			columns: {
				activeTurnId: true,
				attachmentCount: true,
				checkpointIds: true,
				id: true,
				moderatorId: true,
				stateKind: true,
				stateOccurredAt: true,
				stateReason: true,
				status: true,
				title: true,
				topic: true,
				turnIds: true,
				createdAt: true,
				updatedAt: true,
			},
			with: {
				participants: {
					columns: {
						displayName: true,
						id: true,
						model: true,
						provider: true,
						createdAt: true,
						updatedAt: true,
					},
					orderBy: { createdAt: "asc" },
				},
			},
		});

		if (!room) return null;
		return this.mapToDomain(room);
	}

	public async persist(room: Room): Promise<void> {
		const roomRecord = this.mapToPersistence(room);

		const participantRecords = room.get("participants").map((p) => ({
			id: p.id.value(),
			roomId: room.id.value(),
			displayName: p.displayName,
			model: p.get("model").model,
			provider: p.get("model").provider,
			createdAt: p.get("createdAt"),
			updatedAt: p.get("updatedAt"),
		}));

		await this.db.transaction(async (tx) => {
			await tx
				.insert(roomsTable)
				.values(roomRecord)
				.onConflictDoUpdate({
					target: roomsTable.id,
					set: this.without(roomRecord, ["id", "createdAt"]),
				});

			if (participantRecords.length > 0) {
				await tx
					.insert(participantsTable)
					.values(participantRecords)
					.onConflictDoUpdate({
						target: participantsTable.id,
						set: {
							displayName: sql`EXCLUDED.display_name`,
							model: sql`EXCLUDED.model`,
							provider: sql`EXCLUDED.provider`,
							updatedAt: sql`EXCLUDED.updated_at`,
						},
					});
			}
		});
	}

	private mapToDomain(
		raw: typeof roomsTable.$inferSelect & {
			participants: Array<
				Pick<
					typeof participantsTable.$inferSelect,
					| "displayName"
					| "id"
					| "model"
					| "provider"
					| "createdAt"
					| "updatedAt"
				>
			>;
		},
	): Room {
		return Room.init({
			activeTurnId: raw.activeTurnId ? TurnId(raw.activeTurnId) : null,
			attachmentCount: raw.attachmentCount,
			checkpointIds: raw.checkpointIds.map((id) => CheckpointId(id)),
			id: RoomId(raw.id),
			moderatorId: ModeratorId(raw.moderatorId),
			participants: raw.participants.map((p) =>
				Participant.init({
					displayName: p.displayName,
					id: ParticipantId(p.id),
					model: ParticipantModel.init({
						model: p.model,
						provider: p.provider,
					}),
					createdAt: p.createdAt,
					updatedAt: p.updatedAt,
				}),
			),
			state: raw.stateKind
				? RoomState.init({
						kind: raw.stateKind,
						occurredAt: raw.stateOccurredAt,
						reason: raw.stateReason,
					})
				: null,
			status: raw.status,
			title: raw.title,
			topic: raw.topic,
			turnIds: raw.turnIds.map((id) => TurnId(id)),
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	}

	private mapToPersistence(room: Room): typeof roomsTable.$inferInsert {
		return {
			id: room.id.value(),
			moderatorId: room.get("moderatorId").value(),
			title: room.get("title"),
			activeTurnId: room.get("activeTurnId")?.value() ?? null,
			attachmentCount: room.attachmentCount,
			checkpointIds: room.get("checkpointIds").map((id) => id.value()),
			createdAt: room.get("createdAt"),
			stateKind: room.state?.kind,
			stateOccurredAt: room.state?.occurredAt,
			stateReason: room.state?.reason,
			status: room.get("status"),
			topic: room.topic,
			turnIds: room.get("turnIds").map((id) => id.value()),
			updatedAt: room.get("updatedAt"),
		};
	}
}
