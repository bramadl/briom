import type { ICheckpointGenerator } from "@briom/core/app";
import type { RoomId } from "@briom/core/domain";
import type { InngestClient } from "@briom/inngest/client";
import { generateCheckpointTrigger } from "@briom/inngest/triggers";

/**
 * @description
 * `ICheckpointGenerator` implementation that dispatches checkpoint
 * generation to Inngest. Fired from `StreamTurnHandler.generateCheckpoint`
 * once `CheckpointTriggerPolicy` decides accumulated token usage
 * warrants compressing the room's history.
 */
export class InngestCheckpointGenerator implements ICheckpointGenerator {
	public constructor(private readonly client: InngestClient) {}

	public async enqueue(roomId: RoomId): Promise<void> {
		await this.client.send(
			generateCheckpointTrigger.create({ roomId: roomId.value() }),
		);
	}
}
