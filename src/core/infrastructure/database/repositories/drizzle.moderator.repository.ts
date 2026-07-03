import {
	BriomCredit,
	type IModeratorRepository,
	Moderator,
	ModeratorId,
} from "@briom/core/domain";
import type { DrizzleConn } from "@briom/drizzle/db";
import { moderatorsTable } from "@briom/drizzle/schema";

import { DrizzleBaseRepository } from "./drizzle.base.repository";

export class DrizzleModeratorRepository
	extends DrizzleBaseRepository
	implements IModeratorRepository
{
	private columns = {
		avatar: true,
		creditBalance: true,
		email: true,
		id: true,
		name: true,
		createdAt: true,
		updatedAt: true,
	} as const;

	public constructor(private db: DrizzleConn) {
		super();
	}

	public async findByEmail(email: string): Promise<Moderator | null> {
		const moderator = await this.db.query.moderatorsTable.findFirst({
			where: { email },
			columns: this.columns,
		});

		if (!moderator) return null;
		return this.mapToDomain(moderator);
	}

	public async findById(id: ModeratorId): Promise<Moderator | null> {
		const moderator = await this.db.query.moderatorsTable.findFirst({
			where: { id: id.value() },
			columns: this.columns,
		});

		if (!moderator) return null;
		return this.mapToDomain(moderator);
	}

	public async persist(moderator: Moderator): Promise<void> {
		const record = this.mapToPersistence(moderator);
		await this.db
			.insert(moderatorsTable)
			.values(record)
			.onConflictDoUpdate({
				target: moderatorsTable.id,
				set: this.without(record, ["id", "createdAt", "updatedAt"]),
			});
	}

	private mapToDomain(raw: typeof moderatorsTable.$inferSelect): Moderator {
		return Moderator.init({
			avatar: raw.avatar,
			credit: BriomCredit.init({ balance: raw.creditBalance }),
			email: raw.email,
			id: ModeratorId(raw.id),
			name: raw.name,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	}

	private mapToPersistence(
		moderator: Moderator,
	): typeof moderatorsTable.$inferInsert {
		return {
			email: moderator.email,
			id: moderator.id.value(),
			name: moderator.name,
			avatar: moderator.avatar,
			createdAt: moderator.get("createdAt"),
			creditBalance: moderator.credit.balance,
			updatedAt: moderator.get("updatedAt"),
		};
	}
}
