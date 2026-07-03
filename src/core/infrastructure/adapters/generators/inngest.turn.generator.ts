import type { ITurnGenerator } from "@briom/core/app";
import type { RoomId, TurnId } from "@briom/core/domain";
import type { InngestClient } from "@briom/inngest/client";
import { generateTurnTrigger } from "@briom/inngest/triggers";

/**
 * @description
 * `ITurnGenerator` implementation that dispatches participant turn
 * execution to Inngest as a durable background job.
 *
 * `enqueue()` resolves once Inngest accepts the event — it never waits
 * for `turn/execute.requested`'s handling function (which calls
 * `StreamTurnHandler`, the actual LLM streaming work) to complete.
 * This keeps the calling Server Action fast, well under Vercel's
 * function timeout, regardless of how long the LLM stream takes.
 */
export class InngestTurnGenerator implements ITurnGenerator {
	public constructor(private readonly client: InngestClient) {}

	public async enqueue(roomId: RoomId, turnId: TurnId): Promise<void> {
		await this.client.send(
			generateTurnTrigger.create({
				roomId: roomId.value(),
				turnId: turnId.value(),
			}),
		);
	}
}
