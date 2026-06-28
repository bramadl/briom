import { TurnLifecycleOrchestrator, TurnStreamingService } from "@briom/app";
import {
	RoomDeliberation,
	TranscriptorRenderer,
	TurnLimitPolicy,
	TurnTimeoutPolicy,
} from "@briom/domain";
import type { ContainerBuilder } from "@briom/drimion";
import { db } from "@briom/drizzle/client";
import {
	BriomAbortRegistry,
	BriomEventBus,
	BriomScheduler,
} from "@briom/libs/briom/wrappers";
import {
	DrizzleRoomRepository,
	DrizzleTurnRepository,
	DrizzleTurnSequencer,
	DrizzleUsageRepository,
} from "@briom/libs/providers/drizzle";
import { SupabaseSseForwarder } from "@briom/libs/providers/supabase";
import { SupabaseAttachmentStorage } from "@briom/libs/providers/supabase/adapters/supabase.storage";
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
		.add("Adapter:AbortRegistry", () => new BriomAbortRegistry())
		.add("Adapter:SseForwarder", () => new SupabaseSseForwarder())
		.add("Adapter:AttachmentStorage", () => new SupabaseAttachmentStorage())
		.add(
			"Adapter:LlmGateway",
			(r) => new OpenRouterLlmGateway(r["Client:OpenRouter"]),
		)
		.add(
			"Adapter:TurnSequencer",
			(r) => new DrizzleTurnSequencer(r["Client:Database"]),
		)

		.add(
			"Repository:Room",
			(r) => new DrizzleRoomRepository(r["Client:Database"]),
		)
		.add(
			"Repository:Usage",
			(r) => new DrizzleUsageRepository(r["Client:Database"]),
		)
		.add(
			"Repository:Turn",
			(r) => new DrizzleTurnRepository(r["Client:Database"]),
		)

		.add(
			"Policy:TurnTimeout",
			() => new TurnTimeoutPolicy({ ms: TURN_TIMEOUT_MS }),
		)
		.add("Policy:TurnLimit", () => new TurnLimitPolicy())
		.add("Policy:RoomDeliberation", () => new RoomDeliberation())
		.add(
			"Policy:TranscriptorRenderer",
			(r) => new TranscriptorRenderer(r["Adapter:AttachmentStorage"]),
		)

		.add("Orchestrator:TurnLifecycle", (r) => {
			return new TurnLifecycleOrchestrator(
				r["Adapter:EventBus"],
				r["Repository:Turn"],
				r["Adapter:Scheduler"],
				r["Policy:TurnTimeout"],
				r["Adapter:AbortRegistry"],
			);
		})

		.add("Service:TurnStreaming", (r) => {
			return new TurnStreamingService(
				r["Orchestrator:TurnLifecycle"],
				r["Adapter:LlmGateway"],
				r["Adapter:SseForwarder"],
				r["Adapter:AbortRegistry"],
			);
		});
};
