import type { ITopicGenerator } from "@briom/core/app";
import type { RoomId } from "@briom/core/domain";
import type { InngestClient } from "@briom/inngest/client";
import { generateTopicTrigger } from "@briom/inngest/triggers";

/**
 * @description
 * `ITopicGenerator` implementation that dispatches room topic
 * summarization to Inngest. Fired once per room, on the seed
 * (first) turn — see `InitiateTurnHandler.dispatchGenerators`.
 */
export class InngestTopicGenerator implements ITopicGenerator {
	public constructor(private readonly client: InngestClient) {}

	public async enqueue(roomId: RoomId, seedContent: string): Promise<void> {
		await this.client.send(
			generateTopicTrigger.create({ roomId: roomId.value(), seedContent }),
		);
	}
}
