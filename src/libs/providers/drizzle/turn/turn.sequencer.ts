import type { Room } from "@briom/domain";
import { TurnSequence, type TurnSequencer } from "@briom/domain/turn";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { eq, max } from "drizzle-orm";

export class DrizzleTurnSequencer implements TurnSequencer {
	constructor(private readonly db: Database) {}

	async nextPositionInside(room: Room): Promise<TurnSequence> {
		const [result] = await this.db
			.select({ maxSeq: max(turnsTable.sequence) })
			.from(turnsTable)
			.where(eq(turnsTable.roomId, room.id.value()));

		const nextValue = (result?.maxSeq ?? 0) + 1;
		return TurnSequence.fromNumber(nextValue);
	}
}
