import { container } from "@briom";
import { GenerateTopicCommand } from "@briom/core/app";

import { inngest } from "../client";
import { generateTopicTrigger } from "../triggers";

/**
 * @description
 * Generates a room's topic as a durable Inngest function. Fired once
 * per room by `InitiateTurnHandler` on the seed turn.
 *
 * @see InitiateTurnHandler - Who calls the generator:
 * `src/core/application/commands/turns/stream/command.handler.ts`
 *
 * @see GenerateTopicHandler - How it is being processed:
 * `src/core/application/commands/rooms/generate-topic/command.handler.ts`
 */
export const executeGenerateTopicFn = inngest.createFunction(
	{
		id: "execute:generate:topic",
		retries: 2,
		triggers: [generateTopicTrigger],
	},
	async ({ event }) => {
		const { roomId, seedContent } = event.data;

		const result = await container.commandBus.execute(
			new GenerateTopicCommand({ roomId, seedContent }),
		);

		if (result.isError()) {
			throw new Error(
				`Topic generation failed for room ${roomId}: ${result.error().message}`,
			);
		}

		return result.value();
	},
);
