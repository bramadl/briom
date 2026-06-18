import type { ContainerBuilder } from "@briom/drimion";
import { db } from "@briom/drizzle/client";
import { BriomEventBus, BriomScheduler } from "@briom/libs/briom/wrappers";
import { OpenRouterLlmGateway } from "@briom/open-router";
import { openRouter } from "@briom/open-router/client";

export const infrastructureSlice = (container: ContainerBuilder) => {
	return container
		.add("Client:Database", () => db)
		.add("Client:OpenRouter", () => openRouter)
		.add("Adapter:EventBus", () => new BriomEventBus())
		.add("Adapter:Scheduler", () => new BriomScheduler())
		.add(
			"Adapter:LlmGateway",
			(r) => new OpenRouterLlmGateway(r["Client:OpenRouter"]),
		);
};
