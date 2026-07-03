import type { IRoomUnitOfWork } from "@briom/core/app";
import type { IRoomRepository, ITurnRepository } from "@briom/core/domain";
import {
	DrizzleRoomRepository,
	DrizzleTurnRepository,
} from "@briom/core/infra/database";
import type { DrizzleConn } from "@briom/drizzle/db";

export class DrizzleRoomUnitOfWork implements IRoomUnitOfWork {
	public readonly roomRepository: IRoomRepository;
	public readonly turnRepository: ITurnRepository;

	public constructor(private readonly db: DrizzleConn) {
		this.roomRepository = new DrizzleRoomRepository(db);
		this.turnRepository = new DrizzleTurnRepository(db);
	}

	public async execute<T>(
		work: (tx: IRoomUnitOfWork) => Promise<T>,
	): Promise<T> {
		return await this.db.transaction(async (drizzleTx) => {
			const transactionalUoW: IRoomUnitOfWork = {
				roomRepository: new DrizzleRoomRepository(drizzleTx),
				turnRepository: new DrizzleTurnRepository(drizzleTx),
				execute: (nestedWork) => this.execute(nestedWork),
			};

			return await work(transactionalUoW);
		});
	}
}
