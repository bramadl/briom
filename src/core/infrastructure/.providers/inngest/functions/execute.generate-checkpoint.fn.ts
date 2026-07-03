import { container } from "@briom";
import { GenerateCheckpointCommand } from "@briom/core/app";

import { inngest } from "../client";
import { generateCheckpointTrigger } from "../triggers";

/**
 * @description
 * Generates a room's checkpoint as a durable Inngest function. Fired
 * by `StreamTurnHandler.generateCheckpoint` once `CheckpointTriggerPolicy`
 * decides the room's accumulated token usage warrants compression.
 *
 * @see StreamTurnHandler - Who calls the generator:
 * `src/core/application/commands/turns/stream/command.handler.ts`
 *
 * @see GenerateCheckpointHandler - How it is being processed:
 * `src/core/application/commands/rooms/generate-checkpoint/command.handler.ts`
 */
export const executeGenerateCheckpointFn = inngest.createFunction(
	{
		id: "execute:generate:checkpoint",
		concurrency: { limit: 1, key: "event.data.roomId" },
		retries: 2,
		triggers: [generateCheckpointTrigger],
	},
	async ({ event }) => {
		const { roomId } = event.data;

		const result = await container.commandBus.execute(
			new GenerateCheckpointCommand({ roomId }),
		);

		if (result.isError()) {
			throw new Error(
				`Checkpoint generation failed for room ${roomId}: ${result.error().message}`,
			);
		}

		return result.value();
	},
);
