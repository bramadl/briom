import { inngest } from "@briom/inngest/client";
import {
	executeGenerateCheckpointFn,
	executeGenerateTopicFn,
	executeGenerateTurnFn,
	scheduledRefreshFxRatesFn,
} from "@briom/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		executeGenerateTopicFn,
		executeGenerateTurnFn,
		executeGenerateCheckpointFn,
		scheduledRefreshFxRatesFn,
	],
});
