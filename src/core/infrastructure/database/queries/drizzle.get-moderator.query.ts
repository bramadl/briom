import type {
	GetModeratorInput,
	GetModeratorOutput,
	IGetModeratorQuery,
	ModeratorDTO,
} from "@briom/core/app";
import type { DrizzleConn } from "@briom/drizzle/db";

export class DrizzleGetModeratorQuery implements IGetModeratorQuery {
	public constructor(private readonly db: DrizzleConn) {}

	public async execute({
		moderatorId,
	}: GetModeratorInput): Promise<GetModeratorOutput> {
		const moderator = await this.db.query.moderatorsTable.findFirst({
			where: { id: moderatorId },
			columns: {
				avatar: true,
				creditBalance: true,
				email: true,
				id: true,
				name: true,
			},
		});

		if (!moderator) return { moderator: null };

		const moderatorDTO: ModeratorDTO = {
			avatar: moderator.avatar,
			credit: { balance: moderator.creditBalance },
			email: moderator.email,
			id: moderator.id,
			name: moderator.name,
		};

		return {
			moderator: moderatorDTO,
		};
	}
}
