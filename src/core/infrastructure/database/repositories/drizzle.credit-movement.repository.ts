import {
	CreditMovement,
	type ICreditMovementRepository,
	ModeratorId,
} from "@briom/core/domain";
import type { DrizzleConn } from "@briom/drizzle/db";
import { creditMovementsTable } from "@briom/drizzle/schema";
import { Id } from "@drimion";

export class DrizzleCreditMovementRepository
	implements ICreditMovementRepository
{
	public constructor(private db: DrizzleConn) {}

	public async append(movement: CreditMovement): Promise<void> {
		const record = this.mapToPersistence(movement);
		await this.db.insert(creditMovementsTable).values(record);
	}

	public async findByModeratorId(
		moderatorId: ModeratorId,
	): Promise<CreditMovement[]> {
		const creditMovements = await this.db.query.creditMovementsTable.findMany({
			where: { moderatorId: moderatorId.value() },
			columns: {
				amount: true,
				moderatorId: true,
				reason: true,
				type: true,
				createdAt: true,
				id: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return creditMovements.map((creditMovement) =>
			this.mapToDomain(creditMovement),
		);
	}

	private mapToDomain(
		raw: typeof creditMovementsTable.$inferSelect,
	): CreditMovement {
		return CreditMovement.init({
			amount: raw.amount,
			moderatorId: ModeratorId(raw.moderatorId),
			reason: raw.reason,
			type: raw.type,
			createdAt: raw.createdAt,
			id: Id(raw.id),
		});
	}

	private mapToPersistence(
		creditMovement: CreditMovement,
	): typeof creditMovementsTable.$inferInsert {
		return {
			amount: creditMovement.amount,
			id: creditMovement.id.value(),
			moderatorId: creditMovement.moderatorId.value(),
			reason: creditMovement.reason,
			type: creditMovement.type,
			createdAt: creditMovement.get("createdAt"),
		};
	}
}
