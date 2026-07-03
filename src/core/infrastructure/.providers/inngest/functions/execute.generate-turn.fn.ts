import { container } from "@briom";
import { StreamTurnCommand } from "@briom/core/app";

import { inngest } from "../client";
import { generateTurnTrigger } from "../triggers";

/**
 * @description
 * Executes a participant turn's LLM streaming as a durable Inngest
 * function. Deliberately a thin wrapper — all business logic lives in
 * `StreamTurnHandler`.
 *
 * @see InitiateTurnHandler,AcceptProposalHandler,RetryTurnHandler -
 * Who calls the generator:
 * `src/core/application/commands/turns/stream/command.handler.ts`
 * `src/core/application/commands/turns/accept-proposal/command.handler.ts`
 * `src/core/application/commands/turns/retry/command.handler.ts`
 *
 * @see StreamTurnHandler - How it is being processed:
 * `src/core/application/commands/turns/stream/command.handler.ts`
 */
export const executeGenerateTurnFn = inngest.createFunction(
	{
		id: "execute:generate:turn",
		concurrency: { limit: 1, key: "event.data.roomId" },
		retries: 0,
		triggers: [generateTurnTrigger],
	},
	async ({ event }) => {
		const { roomId, turnId } = event.data;

		const result = await container.commandBus.execute(
			new StreamTurnCommand({ roomId, turnId }),
		);

		if (result.isError()) {
			throw new Error(
				`Turn streaming failed for turn ${turnId}: ${result.error().message}`,
			);
		}

		return result.value();
	},
);
