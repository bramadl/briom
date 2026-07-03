import type { ITurnAbortSignal } from "@briom/core/app";
import type { TurnId } from "@briom/core/domain";
import type { DrizzleConn } from "@briom/drizzle/db";
import { turnsTable } from "@briom/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleTurnAbortSignal implements ITurnAbortSignal {
	public constructor(private client: DrizzleConn) {}

	public async clear(turnId: TurnId): Promise<void> {
		await this.flag(turnId, false);
	}

	public async isRequested(turnId: TurnId): Promise<boolean> {
		const turn = await this.client.query.turnsTable.findFirst({
			where: { id: turnId.value() },
			columns: { abortRequested: true },
		});

		if (!turn) return false;
		return turn.abortRequested ?? false;
	}

	public async request(turnId: TurnId): Promise<void> {
		await this.flag(turnId, true);
	}

	private async flag(turnId: TurnId, flag = false): Promise<void> {
		await this.client
			.update(turnsTable)
			.set({ abortRequested: flag })
			.where(eq(turnsTable.id, turnId.value()));
	}
}
