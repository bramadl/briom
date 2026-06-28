import type { IUsageRepository, ModeratorUsage } from "@briom/domain";
import type { Database } from "@briom/drizzle/client";
import { eq, sql } from "drizzle-orm";

import { moderatorUsageTable } from "./usage.model";

/**
 * @description
 * `DrizzleUsageRepository` — Infrastructure Repository
 *
 * PostgreSQL implementation of IUsageRepository using Drizzle ORM.
 * Upserts moderator usage records, handles period resets.
 */
export class DrizzleUsageRepository implements IUsageRepository {
	constructor(private readonly db: Database) {}

	async getUsage(moderatorId: string): Promise<ModeratorUsage | null> {
		const record = await this.db.query.moderatorUsageTable.findFirst({
			where: eq(moderatorUsageTable.moderatorId, moderatorId),
		});

		if (!record) return null;

		return {
			count: record.turnCount,
			periodStart: record.periodStart,
		};
	}

	async increment(moderatorId: string): Promise<void> {
		await this.db
			.insert(moderatorUsageTable)
			.values({ moderatorId, turnCount: 1, periodStart: new Date() })
			.onConflictDoUpdate({
				target: moderatorUsageTable.moderatorId,
				set: { turnCount: sql`${moderatorUsageTable.turnCount} + 1` },
			});
	}

	async resetPeriod(moderatorId: string): Promise<void> {
		await this.db
			.insert(moderatorUsageTable)
			.values({ moderatorId, turnCount: 0, periodStart: new Date() })
			.onConflictDoUpdate({
				target: moderatorUsageTable.moderatorId,
				set: {
					turnCount: 0,
					periodStart: new Date(),
				},
			});
	}
}
