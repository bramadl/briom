import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (owns) => ({
	moderatorsTable: {
		rooms: owns.many.roomsTable(),
		creditMovements: owns.many.creditMovementsTable(),
	},

	roomsTable: {
		moderator: owns.one.moderatorsTable({
			from: owns.roomsTable.moderatorId,
			to: owns.moderatorsTable.id,
		}),
		participants: owns.many.participantsTable(),
		turns: owns.many.turnsTable(),
		checkpoints: owns.many.checkpointsTable(),
	},

	participantsTable: {
		room: owns.one.roomsTable({
			from: owns.participantsTable.roomId,
			to: owns.roomsTable.id,
		}),
	},

	turnsTable: {
		room: owns.one.roomsTable({
			from: owns.turnsTable.roomId,
			to: owns.roomsTable.id,
		}),
	},

	checkpointsTable: {
		room: owns.one.roomsTable({
			from: owns.checkpointsTable.roomId,
			to: owns.roomsTable.id,
		}),
	},

	creditMovementsTable: {
		moderator: owns.one.moderatorsTable({
			from: owns.creditMovementsTable.moderatorId,
			to: owns.moderatorsTable.id,
		}),
	},
}));
