import { TurnLifecycleOrchestrator, TurnStreamingService } from "@briom/app";
import {
	RoomDeliberation,
	TranscriptorRenderer,
	TurnTimeoutPolicy,
} from "@briom/domain";
import type { ContainerBuilder } from "@briom/drimion";
import { db } from "@briom/drizzle/client";
import {
	BriomEventBus,
	BriomScheduler,
	SupabaseSseForwarder,
} from "@briom/libs/briom/wrappers";
import {
	DrizzleRoomRepository,
	DrizzleTurnRepository,
	DrizzleTurnSequencer,
} from "@briom/libs/providers/drizzle";
import { OpenRouterLlmGateway } from "@briom/open-router";
import { openRouter } from "@briom/open-router/client";

const TURN_TIMEOUT_MS = Number.parseInt(
	(process.env.GLOBAL_TURN_TIMEOUT ?? "60000").replace(/_/g, ""),
	10,
);

export const infrastructureSlice = (container: ContainerBuilder) => {
	return container
		.add("Client:Database", () => db)
		.add("Client:OpenRouter", () => openRouter)
		.add("Adapter:EventBus", () => new BriomEventBus())
		.add("Adapter:Scheduler", () => new BriomScheduler())
		.add("Adapter:SseForwarder", () => new SupabaseSseForwarder())
		.add(
			"Adapter:LlmGateway",
			(r) => new OpenRouterLlmGateway(r["Client:OpenRouter"]),
		)
		.add("Adapter:TurnSequencer", (r) => {
			return new DrizzleTurnSequencer(r["Client:Database"]);
		})
		.add("Repository:Room", (r) => {
			return new DrizzleRoomRepository(r["Client:Database"]);
		})
		.add("Repository:Turn", (r) => {
			return new DrizzleTurnRepository(r["Client:Database"]);
		})
		.add("Policy:TurnTimeout", () => {
			return new TurnTimeoutPolicy({ ms: TURN_TIMEOUT_MS });
		})
		.add("Policy:RoomDeliberation", () => {
			return new RoomDeliberation();
		})
		.add("Policy:TranscriptorRenderer", () => {
			return new TranscriptorRenderer();
		})
		.add("Orchestrator:TurnLifecycle", (r) => {
			return new TurnLifecycleOrchestrator(
				r["Adapter:EventBus"],
				r["Repository:Turn"],
				r["Adapter:Scheduler"],
				r["Policy:TurnTimeout"],
			);
		})
		.add("Service:TurnStreaming", (r) => {
			return new TurnStreamingService(
				r["Orchestrator:TurnLifecycle"],
				r["Adapter:LlmGateway"],
				r["Adapter:SseForwarder"],
			);
		});
};
